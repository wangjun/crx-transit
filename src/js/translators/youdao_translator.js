YoudaoTranslator = function() {
  this.name = 'youdao';

  var API_URL = 'http://fanyi.youdao.com/openapi.do?keyfrom=TransIt&key=597592531&type=data&doctype=json&version=1.1&q=';

  var format = function(result) {
    if (!result || result.errorCode) return null;
    var response = {};

    if (result.basic) {
      response.translation = result.basic.explains.join('<br/>');
      if (result.basic.phonetic) {
        response.phonetic = '[' + result.basic.phonetic + ']';
      }
    } else if (result.translation) {
      response.translation = result.translation.join('<br/>');
    }
    if (result.web) {
      response.web = result.web.map(function(kv) {
        return kv.key + ': ' + kv.value.join('；');
      }).join('<br/>');
    }

    if (response.translation.toLowerCase() == result.query.toLowerCase()) {
      return null;
    } else {
      return response;
    }
  };

  var request = function(text, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (this.readyState == 4) {
        var result = JSON.parse(this.responseText);
        callback(format(result));
      }
    };
    xhr.open('GET', API_URL + encodeURIComponent(text), true);
    xhr.send();
  };

  this.translate = function(text, callback) {
    if (/^\s*$/.test(text)) {
      callback(null);
    } else {
      request(text, callback);
    }
  };
};
