
function handleCSMessage(event){

}

function navigate(url){

}
//================== URL Tree ===================================
function CSLoaded(message, listener){  
    
}

async function receiveWSMessage(event){
    
}

function main(){
    const webSocket= new WebSocket("ws://localhost:8000/command");

    
    browser.runtime.onMessage.addListener((message, listener)=>{
        if(message.title=="cs-state"){
            webSocket.send(JSON.stringify({title:"page-status" ,state:"loaded"}));
        }
    });
    webSocket.onmessage=(event)=>{
        console.log(event.data);
        if(event.data=="send"){
            webSocket.send(JSON.stringify({ title:"html_page" ,htmlPage: document.documentElement.outerHTML}));
        }else{
            webSocket.send(JSON.stringify({title:"confirmation", data:event.data}))
        }
    };
}

main();