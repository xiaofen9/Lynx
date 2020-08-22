var FS_ = null;
window.URL = window.URL || window.webkitURL;
window.resolveLocalFileSystemURL = window.resolveLocalFileSystemURL || window.webkitResolveLocalFileSystemURL || window.resolveLocalFileSystemURI;
window.BlobBuilder = window.WebKitBlobBuilder || window.MozBlobBuilder || window.BlobBuilder;
window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;

function outputLog(log,filename){
    FS_.root.getFile(filename, {create: true, exclusive: true}, function(fileEntry) {
    fileEntry.createWriter(function(fileWriter) {
        var blob = new Blob([log], {type: 'text/json'});
        return fileWriter.write(blob);
        
    }, errorCallback);
    }, errorCallback);
}

function errorCallback(e) {
    console.log('Error: ', e);
}


window.requestFileSystem(TEMPORARY, 1024 * 1024,  function(fs) {
    FS_ = fs;
  
}, errorCallback);

function getRequest(details) {

    if (details.method=="POST")
    {
        if (checkType(details.requestBody))
            try {
                if( details.requestBody.formData != undefined){
//                     console.log(details)
                    var postedString =  JSON.stringify(details.requestBody.formData);
                }
                else
                    var postedString = decodeURIComponent(String.fromCharCode.apply(null,
                        new Uint8Array(details.requestBody.raw[0].bytes)));
            }
            catch(e){
                console.log(e);

                return;
            }
//             console.log(postedString)

        if (postedString != undefined ) {

            console.log(postedString);
            console.log(details);
            details.postedString=postedString;
            window.currentlog['req'+details.requestId]=details;
        }
    }

}

function checkType(object) {
    var stringConstructor = "test".constructor;
    var arrayConstructor = [].constructor;
    var objectConstructor = ({}).constructor;

    if (Array.isArray(object)){
        console.log('body is an array',object)
        return false
    }

    if (object === null) 
        return false;
    if (typeof object === 'undefined') 
        return false;
    if (object.constructor === stringConstructor) 
        return true;
    if (object.constructor === arrayConstructor)
        return true;
    if (object!=null && object.constructor === objectConstructor)
        return true;
    return false;
}

function getHeader(details) {
    if(window.currentlog['req'+details.requestId]!=null)
        window.currentlog['req'+details.requestId].requestHeaders=details.requestHeaders;
}

window.running=false;
window.currentlog={};

function startLogging(){
    if(window.running){
        alert('please stop logging before start');
        return;
    }
    window.running=true;
    window.currentlog={};
    chrome.webRequest.onBeforeRequest.addListener(
        getRequest,
        {urls: ["<all_urls>"]},
        ['requestBody','extraHeaders']
    );
    chrome.webRequest.onBeforeSendHeaders.addListener(
        getHeader,
        // filters
        {urls: ["<all_urls>"]},
        // extraInfoSpec
        ['requestHeaders', 'extraHeaders']
    );
}

function stopLogging(){
    chrome.webRequest.onBeforeRequest.removeListener(getRequest);
    chrome.webRequest.onBeforeSendHeaders.removeListener(getHeader);
    window.running=false;
    if(window.currentlog=={})
        return;
    var timestamp = new Date().getTime();
    console.log(window.currentlog);
    outputLog(JSON.stringify(window.currentlog),'log_'+timestamp.toString()+'.json');
}


document.getElementById('start').onclick = function() {
    document.getElementById('start').disabled=true;
    document.getElementById('stop').disabled=false;
    startLogging();   
}
document.getElementById('stop').onclick = function() {
    document.getElementById('start').disabled=false;
    document.getElementById('stop').disabled=true;
    stopLogging();   
}