function getCurrentUrlBase(){
    let currentUrl= window.location.href;
    let urlObj= new URL(currentUrl);
    return urlObj.origin;
}

// developer.mozilla.com
function getAllUrls(baseUrl= ""){
    let allLinks= document.querySelectorAll("a");   
    let allUrls= [];
    allLinks.forEach((link)=>{
        if (baseUrl!= ""){
            let checkBaseUrlRegex= new RegExp(`${baseUrl}/*`, "g");
            // console.log(domainName, typeof(link.href) ,regex.test(link.href), link.href);
            if(checkBaseUrlRegex.test(link.href)){
                allUrls.push(link.href);
            }
        }else{ 
            allUrls.push(link.href);
        }
    });
    return allUrls;
}
// build a trie out of the urls to store our urls in a tree like manner
function constructUrlTrie(urls){
    const currentUrl= getCurrentUrlBase() + "/";
    let urlTrie= {};

    for (let i=0; i< urls.length; i++){
        const currentUrlWithoutBase= urls[i].split(currentUrl);
        let urlPathArray= currentUrlWithoutBase[1].split("/");
        insertNewUrlInTrie(urlPathArray, urlTrie);
    }
    console.log(urlTrie);
    return urlTrie;
}

function insertNewUrlInTrie(urlPathArray, urlTrie){
    if(urlPathArray.length==0 || urlPathArray[0]== ""){
        if(!urlPathArray["*"]){
            urlTrie["*"]=true;
        }
        return;
    }
    if(urlTrie[urlPathArray[0]]== undefined){
        urlTrie[urlPathArray[0]]= {}
    }
    insertNewUrlInTrie(urlPathArray.slice(1),urlTrie[urlPathArray[0]]);
}

// end building trie.
// console.log(constructUrlTrie(getAllUrls(getCurrentUrlBase())));


browser.runtime.onMessage.addListener((message)=>{
    window.location.href= "https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/query";
});

// Connection to websocket

function receiveWSMessage(event){
    // showToDebug(event.data);
}
  
function sendMessageToWS(data, wsConnection){
  // showToDebug("sending to the web socket");
  wsConnection.send(data);
}
  
// End connection to websocket

//================browser actions
    // Each browser action need to be asynchronous to make sure we are waiting for the page to fully load
async function listJobCards(waitTime){
    // we have to wait for the page to be loaded
    await setTimeout(async()=>{
        scrollBottom({type:"class", name:"GDWMPYlbLLvJwwJkvOFRdwOcJxcoOxMsCHeyMglQ"}, 4000);
        const jobList= getEl({type:"class", name:"job-card-container"}, true);
        console.log({jobList});
        for(let i=0; i<jobList.length; i++){
            mouseClick(jobList[i]);
        }
    }, waitTime);
}

function scrollBottom(selector, scrollPosition){
    try{
        const elementToScroll= getEl(selector,false);
        console.log({elementToScroll});
        elementToScroll.scrollTop= scrollPosition;
    }catch(error){
        throw new Error(error);
    }
}

async function mouseClick(elementToClick, waitTime=0){
    try{    
        console.log(elementToClick);
        await setTimeout(()=>{
            elementToClick.click();
        }, waitTime);
    }catch(error){
        console.error(error);
        throw new Error(`An error occured when trying to click the element: ${selector}`);
    }
}

function getEl(selector, returnMany= false){ // will receive an object of form:   { type:id|class, name:"the id name,..." } => will return the first element 
    try{
        let result= undefined;
        if(selector.type== "tag"){
            if(returnMany){
                result= document.getElementsByTagName(selector.name);
            }else{
                result= document.getElementsByTagName(selector.name)[0];
            }
        } else if( selector.type== "class"){
            if(returnMany){
                result= document.getElementsByClassName(selector.name);
            }else{
                result= document.getElementsByClassName(selector.name)[0];
            }
        } else if (selector.type=="id"){
            result= document.getElementById(selector.name);
        }else{ 
            throw new Error("The selector object was invalid");
        }
        if(result== undefined){
            throw new Error("Unable to get the specified element");
        }
        return result;
    }catch(error){
        throw new Error(error.message);
    }
}


//===============end browser actions


async function main(){
    // console.log(document.documentElement.outerHTML);
    const bsPort= browser.runtime.connect();  // Connect to the background script with an open connection

    bsPort.postMessage({
        title: "cs-state", 
        data: {state:"loaded", url: window.location.href}
    });

    bsPort.onMessage.addListener((message)=>{
        console.log(`The background script received: ${JSON.stringify(message)}`);
        // console.log(message.data);
    });
    
    await listJobCards(5000);
    const nextButton= getEl({type:"class", name:"jobs-search-pagination__button--next" });
    console.log({nextButton});
    mouseClick(nextButton);
}

main();