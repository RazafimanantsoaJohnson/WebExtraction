console.log("Is it not working");
browser.runtime.onMessage.addListener(showMessage);

function showMessage(){
    console.log("I am here, loaded and alive");
    console.log("Nothing??");
}
