
let myBtn= document.querySelector("#BUTTON");
let trieContent= document.querySelector("#trieContent");

browser.runtime.onMessage.addListener(showTrieContent);

function showTrieContent(message, listener){
    
    trieContent.textContent= JSON.stringify(message.data);
}

myBtn.addEventListener(
    "click", 
    sendMessageToContentScript
);

function sendMessageToContentScript(){
    console.log("Hello Johnson BG");
    browser.tabs.sendMessage({data: "Hello Cherieee"});
}

