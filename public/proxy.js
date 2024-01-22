// chrome.storage.sync.get(['apiurl'], function (result) {

//     chrome.storage.sync.set({ backup: result.apiurl });

//     var config = {
//         mode: "fixed_servers",
//         rules: {
//             singleProxy: {
//                 scheme: "http",
//                 host: result.apiurl.split(":")[0],
//                 port: parseInt(result.apiurl.split(":")[1])
//             },
//             bypassList: ["localhost"]
//         }
//     };

//     console.log(config);

//     chrome.proxy.settings.set({
//         value: config,
//         scope: "regular"
//     }, function () { console.log("Saved2") });
// });

chrome.webRequest.onAuthRequired.addListener(function () {
    console.log("onAuthRequired");
    return {
        authCredentials: {
            username: 'azvesxqf',
            password: 'i4904jb14zb9',
        }
    };
}, { urls: ['<all_urls>'] }, ['asyncBlocking']);


function setProxy(passedUrl) {
    var config = {
        mode: "fixed_servers",
        rules: {
            singleProxy: {
                scheme: "http",
                host: passedUrl.split(":")[0],
                port: parseInt(passedUrl.split(":")[1])
            },
            bypassList: ["localhost"]
        }
    };

    chrome.proxy.settings.set({
        value: config,
        scope: "regular"
    }, function () { console.log("Saved2") });
    
}
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'setProxy') {
        setProxy(request.url);
    }
});

