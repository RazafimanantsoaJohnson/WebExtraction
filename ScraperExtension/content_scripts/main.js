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

async function mouseClick(elementsToClick, waitTime=0){
    try{    
        const isElementsCollection= elementsToClick.constructor.name === "HTMLCollection";
        if(isElementsCollection){
            for(let i=0; i<elementsToClick.length; i++){
                setTimeout(()=>{
                    elementsToClick[i].click();
                }, waitTime);
            }
        }else{
            setTimeout(()=>{
                elementsToClick.click();
            }, waitTime);
        }
    }catch(error){
        console.error(error);
        throw new Error(`An error occured when trying to click the element: ${selector}`);
    }
}

function getEl(selector, returnMany= false){ // will receive an object of form:   { type:id|class, name:"the id name,..." } => will return the first element 
    try{
        let result= undefined;
        let parent= document;
        if(selector.parentSelector){
            parent= getEl(selector.parentSelector);
            console.log({parent});
        }
        if(parent){
            switch(selector.type){
                case "tag":
                    if(returnMany){
                        result= parent.getElementsByTagName(selector.name);
                    }else{
                        result= parent.getElementsByTagName(selector.name)[0];
                    }
                    break;
                case "class":
                    if(returnMany){
                        result= parent.getElementsByClassName(selector.name);
                    }else{
                        result= parent.getElementsByClassName(selector.name)[0];
                    }
                    break;
                case "id":
                    result= parent.getElementById(selector.name);
                    break;
                case "tree":
                    if(returnMany){
                        result= parent.querySelectorAll(selector.name);
                    }else{
                        result= parent.querySelector(selector.name);
                    }
                    break;
                default:
                    throw new Error("The selector object was invalid");
            }
        }
        if(result== undefined){
            throw new Error(`Unable to get the specified element ${selector.type}:${selector.name}`);
        }
        return result;
    }catch(error){
        throw new Error(error.message);
    }
}


//===============end browser actions
async function executeReceivedActions(actions, bsPort){ // Takes the list of actions and the connection to the background script (which will send data to the back)
    try{
        console.log({actions});
        for (let i=0; i<actions.length; i++){
            switch(actions[i]["type"]){
                case "scroll":
                    await scrollBottom(actions[i]["selector"], actions[i]["position"]);
                    returnExtractedData(actions[i], bsPort);
                    break;
                case "click":
                    let elementsToClick= getEl(actions[i]["selector"], actions[i]["isMany"]);     // this call should change to be based on the specified parent
                    await mouseClick(elementsToClick, actions[i]["waitTime"]?actions[i]["waitTime"]:0 );
                    setTimeout(()=>{returnExtractedData(actions[i],bsPort);}, 3000)
                    
                    break;
                default:
                    throw new Error("The desired action is not recognized");
            }
        }
    }catch(error){
        console.error("An error occured when executing the actions from the web socket");
        console.log({error});
    }
    
}

function returnExtractedData(action, bsPort){
    try{
        if(action["extract"]){
            let extractedDataFromAction= extractText(action["extract"]["selector"], action["extract"]["isMany"]);
            bsPort.postMessage({title:"return-data", data: extractedDataFromAction});
        }
    }catch(error){
        raiseError("Something went wrong when returning the extractedData", bsPort);
    }
}

function raiseError(message, bsPort){
    console.error(message);
    bsPort.postMessage({title:"error", data: message })
    throw new Error(message);
}

function extractText(selector, isMany){     // He will have a different kind of selector, we will want to define his parent too 
    try{
        const elementsToExtract= getEl(selector, isMany);
        let results=[];
        let isElementsToExtractCollection= elementsToExtract.constructor.name=== "NodeList";    // querySelectorAll returns "NodeList" and not "HTMLCollection"
        if(!isElementsToExtractCollection){
            return elementsToExtract.innerText;
        }
        for(let i=0; i<elementsToExtract.length; i++){
            results.push(elementsToExtract[i].innerText);
        }
        return results;
    }catch(error){
        console.error("An error occured when trying to Extract Text");
        console.log({ExtractTextError: error})
    }
}

function testFunction(){
    console.log(
        getEl({
            type:"class", 
            name: "job-card-list__title--link",
            parentSelector: {
                type:"class",
                name: "bmneyvcsyJQLUJRbVrfBkyewMaEqzVKyMUg"
            }
        })
    );
    console.log(extractText({
        type: "tree", 
        name: "a.job-card-list__title--link > span> strong"
    },true));
    console.log(extractText({
        type: "tree", 
        name: "a.job-card-list__title--link > span> strong"
    },false))
    
}

async function main(){
    // console.log(document.documentElement.outerHTML);
    const bsPort= browser.runtime.connect();  // Connect to the background script with an open connection
    let actionWaitTime;
    
    bsPort.postMessage({
        title: "cs-state", 
        data: {state:"loaded", url: window.location.href}
    });

    bsPort.onMessage.addListener((message)=>{
        console.log(`The background script received: ${JSON.stringify(message)}`);
        // console.log(message.data);
        if(message.title== "actions"){
            setTimeout(()=>{
                // test
                // testFunction();
                // endTest
                executeReceivedActions(message.data.actions, bsPort);
            },message.data.waitTime);
        }
    });
    console.log({actionWaitTime});  // will never show data because of asynchronism
}

main();