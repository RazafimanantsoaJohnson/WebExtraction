
function handleCSMessage(event){

}

function navigate(url){

}
//================== URL Tree ===================================

async function receiveWSMessage(event, csConnection){
    console.log(event.data);
    if(event.data=="send"){
        webSocket.send(JSON.stringify({ title:"html_page" ,htmlPage: document.documentElement.outerHTML}));
    }else{
        let jsonMessage= JSON.parse(event.data);
        if (jsonMessage.url){
            webSocket.send(JSON.stringify({ title:"confirmation" ,data:jsonMessage}));
        }
    }
}

async function connectToCS(port, webSocket){
    port.postMessage("Ty nenao content script");
    port.onMessage.addListener((message)=>{
        if(message.title=="cs-state"){
            webSocket.send(JSON.stringify({title:"page-status" ,state:"loaded", url: message.data.url}));
        }    
    })
    webSocket.onmessage=(event)=>{
        port.postMessage(event.data);
    };
}

// We will create the connection background-contentScript from the background script and send the first message on 
async function main(){
    try{
        const webSocket= new WebSocket("ws://localhost:8000/command");
        
        browser.runtime.onConnect.addListener((port)=>{
            connectToCS(port, webSocket);
        });
        window.dataExtract.port.postMessage("A message from outside");
    

    }catch(error){
        console.error(error);
    }
}

main();