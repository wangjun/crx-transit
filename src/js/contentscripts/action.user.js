// Chrome disabled contentscript in webstroe.
// via: http://stackoverflow.com/a/11614440/260793

var $link = null;

function getSelectionRect(evt, selection) {
    var rect = selection.getRangeAt(0).getBoundingClientRect();

    // 如果是在文本框中，这个坐标返回的会为 0，此时应该取鼠标位置
    if (rect.left === 0 && rect.top === 0) {
        rect = { left: evt.clientX, top: evt.clientY, height: 15 };
    }

    var left = rect.left + document.body.scrollLeft;
    var top  = rect.top + document.body.scrollTop;

    var clientHeight = (document.body.clientHeight < document.documentElement.clientHeight) ? document.body.clientHeight : document.documentElement.clientHeight;
    if (clientHeight === 0) {
        clientHeight = document.documentElement.clientHeight;
    }
    if (rect.top >= 150) {
        var bottom = clientHeight - top;
        return { left: left, bottom: bottom };
    } else {
        return { left: left, top: top + rect.height + 5 };
    }
}

function transIt(evt) {
    $('body').removeClass('transit-link-inspect-mode');

    var selection = window.getSelection();
    var text = $.trim(selection.toString());

    if (text) {
        var position = getSelectionRect(evt, selection);

        chrome.runtime.sendMessage({ type: 'selection', text: text, position: position });
        if (options.notifyMode === 'in-place') {
            doNotify(text, position);
        }
    }
}

var capslockEvents = [];
function toggleLinkInspectMode(evt) {
    if (!(options.linkInspect && evt.keyCode == 20)) return;

    capslockEvents.push(evt.keyCode);
    if (capslockEvents.length == 1) {
        var timer = setTimeout(function() {
            capslockEvents = [];
            clearTimeout(timer);
        }, 500);
    } else {
        $('body').toggleClass('transit-link-inspect-mode');
        capslockEvents = [];
    }
}

initOptions(function(options) {
    $(document).on('keyup keydown', toggleLinkInspectMode);
    $(document).on('mouseup', transIt);
    log('action.user.js initialized.');
});
