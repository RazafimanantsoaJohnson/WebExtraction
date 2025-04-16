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


async function main(){

    browser.runtime.sendMessage({
        title: "UrlTrie", 
        data: constructUrlTrie(getAllUrls(getCurrentUrlBase()))
    });
}

main();