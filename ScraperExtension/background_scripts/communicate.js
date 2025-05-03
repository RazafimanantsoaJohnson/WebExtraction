
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
        let jsonWSMessage= JSON.parse(event.data);
        if(jsonWSMessage.title== "actions"){
            csConnection.postMessage(jsonWSMessage);  
        }
    }
}

async function connectToCS(port, webSocket){
    port.onMessage.addListener((message)=>{
        if(message.title=="cs-state"){
            webSocket.send(JSON.stringify({title:"page-status" ,state:"loaded", url: message.data.url}));
        }
        if(message.title=="return-data"){
            webSocket.send(JSON.stringify(message));
        }
    });``
    webSocket.onmessage=(event)=>{
        receiveWSMessage(event, port);
    };
}

// We will create the connection background-contentScript from the background script and send the first message on 
async function main(){
    try{
        const webSocket= new WebSocket("ws://localhost:8000/command");
        
        browser.runtime.onConnect.addListener((port)=>{
            connectToCS(port, webSocket);
        });
    

    }catch(error){
        console.error(error);
    }
}

main();