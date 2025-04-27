const canvasElement= document.getElementById("navigationTree");

browser.runtime.onMessage.addListener(showTrieContent);
//================== URL Tree ===================================
function showTrieContent(message, listener){  // listens to the message from the content_script
    
    // debugEl.textContent= JSON.stringify(message.data);
    // urlInTrye= getUrlInTrye(message.data);
    
}

function getUrlInTrye( trye ){
    try{
        // take the urls in a breadth first manner
        brothers= Object.keys(trye);
        debugEl.textContent= JSON.stringify( brothers);
        debugEl.textContent+= "\n" +JSON.stringify(Object.keys(trye[brothers[0]]));
        // return url;
    }catch(error){
        console.error(error);
        debugEl.textContent= error.message;
    }
}


function getCanvasContext(){
    if (canvasElement.getContext){
        // get the context and scale the context well to get the same 'pixel sizes' as in css
        const canvasContext= canvasElement.getContext("2d") ;
        const scale= window.devicePixelRatio;
        canvasElement.width= canvasElement.clientWidth* scale; 
        canvasElement.height= canvasElement.clientHeight* scale;
        canvasContext.scale(scale, scale);
        return canvasContext;
    }
    debugEl.textContent= "We couldn't get the canvas' context";
    return;
}

function drawRectangle(){
    let ctx= getCanvasContext();
    if(ctx){
        ctx.fillStyle= "red";
        ctx.fillRect(10,10,50,50);
    }
    debugEl.textContent="the draw rectangle is run";
}

function drawURLRectangle( url ,x,y, paddingH= 0, paddingV= 0){
    let ctx= getCanvasContext();
    ctx.fillStyle= "black";
    ctx.textBaseline="top";
    ctx.font= "14px Roboto";
    currentTextMeasurements= ctx.measureText("A text drawn in a canvas");
    debugEl.textContent= currentTextMeasurements.width;
    ctx.fillText("A text drawn in a canvas", x + (paddingH/2), y+ paddingV);
    ctx.strokeRect(x,y, currentTextMeasurements.width+ paddingH, 20 + paddingV)
}

//================================== End URL Tree==================================

// To be sent to another file

// a request is always made to:  https://developer.mozilla.org/api/v1/whoami
let apiRequests= [];

function hideHTMLElement(htmlElement){
  htmlElement.style.display= "none";
}
function showHTMLElement(htmlElement){
  htmlElement.style.display=""
}

function stateChangeHandler(event, webSocketConnection, currentTabId){
  const explainationText= document.getElementById("explainations");
  const apiLogs= document.getElementById("api-logs");

  if(event.target.checked){
    hideHTMLElement(explainationText);
    showHTMLElement(apiLogs);
    browser.webRequest.onBeforeRequest.addListener((requestDetail)=>{
      if(requestDetail.tabId=== currentTabId){    // filter to only log the requests of the "active tab"
        logAPIRequest(requestDetail,webSocketConnection);
      }
    }, {
      urls: ["<all_urls>"]
    }, ["blocking"]);
  }else{
    showHTMLElement(explainationText);
    hideHTMLElement(apiLogs);
    browser.webRequest.onBeforeRequest.removeListener((requestDetail)=>{});
  }
}

function logAPIRequest(requestDetail, webSocketConnection){
  try{
    const currentRequest= {};
    const decoder= new TextDecoder("utf-8");

    let filter= browser.webRequest.filterResponseData(requestDetail.requestId);

    
    // showToDebug(`id: ${requestDetail.requestId} ,filter: ${JSON.stringify(filter)}`);
    
    filter.ondata= (event)=>{
      let decodedResponse= decoder.decode(event.data, {stream: true})
      
        currentRequest.url= requestDetail.url; 
        currentRequest.data= decodedResponse;
        currentRequest.method= requestDetail.method;
        // showToDebug(decodedResponse);
        filter.write(event.data);
      
        apiRequests.push(currentRequest);
        createAndDisplayAPIRequests(currentRequest, webSocketConnection);
      };
      filter.onstop= (event)=>{
        filter.close();
      };
    }catch(error){
      showToDebug(error.message,2)
    }
  }
  
  //End To be sent to another file


// To another file again
// Will create the API Request components in the list with the right classes and based on the "request" array
function createAndDisplayAPIRequests(requestObject, webSocketConnection){
  try {
    let requestList= document.getElementById("request-list");
    let requestComponent= document.createElement("div");
    let requestMethod= document.createElement("div");
    let requestUrl= document.createElement("div");
    
    requestComponent.classList.add("request-component");
    requestComponent.classList.add("bg-secondary");
    requestMethod.classList.add("request-method");
    requestUrl.classList.add("request-url");

    requestUrl.textContent= requestObject.url;
    requestMethod.textContent= (requestObject.method).toUpperCase();
    requestComponent.appendChild(requestMethod);
    requestComponent.appendChild(requestUrl);
    requestList.appendChild(requestComponent);

    requestComponent.addEventListener("click" , function(e){
      let responseElement= document.getElementById("api-response");
      responseElement.textContent= requestObject.data;  
      saveSelectedUrlToState(requestObject.url);
      
      showToDebug(JSON.stringify(window.dataExtract));
      sendMessageToWS(requestObject.data, webSocketConnection);  //     ( send data to the Web Socket )
      // test
      // navigate("https://www.google.com");
      
    });
  } catch (error) {
    throw new Error(error.message);
  }
}

async function getCurrentTabId(){
  const tabs= await browser.tabs.query({active: true, currentWindow:true});
  if (tabs[0]){
    showToDebug(JSON.stringify(tabs));
    return tabs[0].id;
  }
}

//===== Flag Status and Button ==================
function handleFlagClick(){
  const flagButton= document.getElementById("flag-btn");
  flagButton.addEventListener("click", flagURLRequest)
}

function checkFlagStatus(){   // will return the index of the selected URL if it is in the flaggedUrls state but will return -1 if not
  const flaggedUrls= window.dataExtract.flaggedUrls;
  const currentSelectedUrl= window.dataExtract.selectedUrl;
  if (flaggedUrls.length== 0){
    return -1;
  }
  for(let i=0; i<flaggedUrls.length; i++){
    if(flaggedUrls[i]== currentSelectedUrl){
      return i;
    }
  }
  return -1;
}

function updateFlagButton(isActive){
  const flagButton= document.getElementById("flag-btn");
  if(isActive){
    flagButton.classList.remove("btn");
    flagButton.classList.add("btn-active");
  }else{
    flagButton.classList.add("btn");
    flagButton.classList.remove("btn-active");
  }
}

function flagURLRequest(event){
  let selectedUrlIndex= checkFlagStatus();
  showToDebug(selectedUrlIndex);
  if (selectedUrlIndex== -1){
    window.dataExtract.flaggedUrls.push(window.dataExtract.selectedUrl);
    updateFlagButton(true);
  }else{
    window.dataExtract.flaggedUrls.splice(selectedUrlIndex,1);
    updateFlagButton(false);
  }
  showToDebug(JSON.stringify(window.dataExtract));
}


function saveSelectedUrlToState(urlLink){
  window.dataExtract.selectedUrl= urlLink;
  let currentFlagStatus= checkFlagStatus();
  if(currentFlagStatus== -1){
    updateFlagButton(false);
  }else{
    updateFlagButton(true);
  }
}

// =============== End Flag Status and Button =======================

//End to another file

// Connection to websocket

function receiveWSMessage(event){
  showToDebug(event.data);
}

async function sendMessageToWS(data, wsConnection){
  // showToDebug("sending to the web socket");
  await wsConnection.send(data);
}

// End connection to websocket

// Function to navigate to a link
function navigate(url){
  browser.tabs.create({
    url: url, 
    active: true
  });
  browser.tabs.sendMessage({
    message: "I give the speech to the content script"
  })
}

async function test_send_command(){
  const webSocket= new WebSocket("ws://localhost:8000/command");
  await setTimeout(()=>{
    webSocket.send(JSON.stringify({command:"register", url: window.location.href }));
  }, 2000);
}


function showToDebug(message, type=1){
  let debugEl= document.getElementById("debugger");
  if (type!=1){
    debugEl.style.color= "red";
  }
  debugEl.style.color= "gray";
  debugEl.textContent= message; // JSON.stringify(apiRequests);
}


async function main(){
  const webSocket= new WebSocket("ws://localhost:8000/ws");

  const status= document.getElementById("api-listener-state");
  window.dataExtract= {
    flaggedUrls: []
  }  // create my own namespace for me to store states available through out the app
  
  showToDebug(status.checked);

  await getCurrentTabId();
  await test_send_command();    // test send command
  status.addEventListener("change", async (event)=>{
    let currentTabId= await getCurrentTabId();
    stateChangeHandler(event, webSocket, currentTabId);
  })
  handleFlagClick();

  webSocket.onmessage(receiveWSMessage);
}

main();