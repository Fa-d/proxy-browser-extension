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

chrome.webRequest.onBeforeRequest.addListener(
    function (details) {
        const size = details.requestBody ? details.requestBody.raw[0].bytes.length : 0;
        chrome.storage.local.set({
            [details.tabId]: {
                startTime: performance.now(),
                size: size
            }
        });
    },
    { urls: ["<all_urls>"] }
);

chrome.webRequest.onCompleted.addListener(
    function (details) {
        chrome.storage.local.get([details.tabId], function (result) {
            const data = result[details.tabId];
            if (data) {
                const duration = (performance.now() - data.startTime) / 1000;
                const speed = data.size / duration;
                chrome.storage.local.set({
                    [details.tabId]: {
                        speed: speed
                    }
                });
            }
        });
    },
    { urls: ["<all_urls>"] }
);
