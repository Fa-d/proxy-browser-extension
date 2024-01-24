chrome.webRequest.onAuthRequired.addListener(
    function (details) {
        return {
            authCredentials: {
                username: 'azvesxqf',
                password: 'i4904jb14zb9',
            }
        };
    },
    { urls: ["<all_urls>"] },
    ['blocking']
);

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
    }, function () { });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'setProxy') {

        if (chrome.webRequest.onAuthRequired.hasListener()) {
            chrome.webRequest.onAuthRequired.removeListener();
        }

        chrome.webRequest.onAuthRequired.addListener(
            function (details) {
                return {
                    authCredentials: {
                        username: 'azvesxqf',
                        password: 'i4904jb14zb9',
                    }
                };
            },
            { urls: ["<all_urls>"] },
            ['blocking']
        );
        setProxy(request.url);
        console.log(request.url + "runtime");
    }
});

