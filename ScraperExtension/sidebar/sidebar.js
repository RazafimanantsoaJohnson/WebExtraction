
const canvasElement= document.getElementById("navigationTree");

let myBtn= document.querySelector("#BUTTON");
let debugEl= document.getElementById("debugger");
if(!debugEl){
    debugEl.textContent= "Couldn't find the 'Trie Content' element";
}

debugEl.style.color= "blue";

browser.runtime.onMessage.addListener(showTrieContent);

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




// drawRectangle();
// drawURLRectangle(0,0, 8,4);



// To be sent to another file

// a request is always made to:  https://developer.mozilla.org/api/v1/whoami
let apiRequests= [];

async function logAPIRequest(requestDetail){
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
        createAndDisplayAPIRequests(currentRequest);
      };
      filter.onstop= (event)=>{
        filter.close();
      }
      // apiRequests.push(currentRequest);
    }catch(error){
      showToDebug(error.message,2)
    }
  }

  browser.webRequest.onBeforeRequest.addListener(logAPIRequest, {
    urls: ["<all_urls>"]
  }, ["blocking"]);
  
  // showToDebug(JSON.stringify(apiRequests));
  
  //End To be sent to another file


// To another file again
  // Will create the API Request components in the list with the right classes and based on the "request" array
  function createAndDisplayAPIRequests(requestObject){
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

    requestComponent.addEventListener("click" ,clickAPIRequest(requestObject.data));
  }

  function clickAPIRequest(textResponse){
    let responseElement= document.getElementById("api-response");
    responseElement.textContent= textResponse;
  }

//End to another file
  
function showToDebug(message, type=1){
  if (type!=1){
    debugEl.style.color= "red";
  }
  debugEl.style.color= "gray";
  debugEl.textContent= message; // JSON.stringify(apiRequests);
}