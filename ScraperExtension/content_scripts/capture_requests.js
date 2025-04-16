console.log("We are now in capture requests.js");

// connect a listener to a "web request event"

browser.webRequest.onCompleted.addListener(logRequest, { urls:["<all_urls>"] });

function logRequest(requestDetail){
    console.log(`A request was made on ${requestDetail.url}`)
}

