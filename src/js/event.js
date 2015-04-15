var API_URL = 'http://fanyi.youdao.com/openapi.do?keyfrom=TransIt&key=597592531&type=data&doctype=json&version=1.1&q=';
var PUSH_URL = 'http://trit.herokuapp.com/api/items';
var currentText = '';
var TRANSLATORS = {
    baidu: BaiduTranslator,
    youdao: YoudaoTranslator
};

// 推送词条到服务器
// TODO: 实现用户登录功能，将词条推送到自己的账户下
function pushItem(name, explaination) {
    var params = Object.toQueryString({
        name: name,
        explaination: explaination
    });

    log("  Pushing translation to server:", params);
    var xhr = new XMLHttpRequest();
    xhr.open('POST', PUSH_URL, true);
    xhr.setRequestHeader('Content-Type', 'multipart/form-data');
    xhr.setRequestHeader("Content-length", params.length);
    xhr.setRequestHeader("Connection", "close");
    xhr.send(params);
}


// 执行翻译动作
function translateHanlder(request, sender, sendResponse) {
    // 如果翻译已经缓存起来了，则直接取缓存中的结果，不再向服务器发请求
    // TODO 优化代码结构，消除重复代码，简化逻辑 @greatghoul
    // TODO 为翻译缓存提供简单统计 @greatghoul
    var title = request.from == 'page' ? fmt(TPLS.TITLE, request.text) : '';
    var service = TRANSLATORS[options.translator];
    currentText = request.text;

    // 如果词为空，则不再翻译
    if (!currentText) return;

    log('Translating', currentText, 'from', service.name);
    service.translate(currentText, function(result) {
        var translation = fmt(TPLS.WARNING, title + '未找到释义');

        if (result) {
            log('=>', result);
            translation = result.translation;
            if (result.phonetic) {
                var phonetic = fmt(TPLS.PHONETIC, result.phonetic);
                translation = phonetic + translation;
            }
            if (result.web) {
              var web = fmt(TPLS.WEB, result.web);
              translation = translation + web;
            }

            translation = fmt(TPLS.SUCCESS, title + translation); 
        } else {
            log('WARNING: translation not found.');
        }

        sendResponse({ translation: translation });
    });
}

function selectionHandler(request, sender, sendResponse) {
    currentText = request.text;
    talkToPage(null, request);
}

registerMessageDispatcher({
    translate: translateHanlder,
    selection: selectionHandler
});

// Cleanup scripts for release 1.2
// Will be removed in next release.
function clearCacheStuff(details) {
    if (details.reason == 'update') {
        localStorage.clear();
        log('Cache cleaned up');
    }
}

initOptions(function() {
    chrome.runtime.onInstalled.addListener(clearCacheStuff);
}); 
