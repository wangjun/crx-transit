var background = chrome.extension.getBackgroundPage();

function openOrFocusOptionsPage(event) {
  event.preventDefault();

  if (event.altKey) {
    var width = 800,
        height = 600,
        left = screen.width / 2 - width / 2,
        top = screen.height / 2 - height / 2;

    chrome.windows.create({
      type: 'popup',
      width: width,
      height: height,
      left: left,
      top: top,
      url: 'jasmine/SpecRunner.html'
    });

    return false;
  }

  var optionsUrl = chrome.extension.getURL('options.html');
  chrome.tabs.query({}, function(extensionTabs) {
    var found = false;
    var i = 0;

    while (i < extensionTabs.length) {
      if (optionsUrl == extensionTabs[i].url) {
        found = true;
        chrome.tabs.reload(extensionTabs[i].id);
        chrome.tabs.update(extensionTabs[i].id, { highlighted: true });
      }

      i++;
    }

    if (!found) {
      chrome.tabs.create({url: 'options.html'});
    }

    window.close();
  });
}

$('.btn-options').on('click', openOrFocusOptionsPage);

var app = angular.module('TransitPopupApp', ['monospaced.elastic']);

app.directive('ngEnter', function() {
  return {
    link: function(scope, element, attrs) {
      element.bind('keydown keypress', function(event) {
        if (event.which == 13) {
          event.preventDefault();
          scope.$apply(function() {
            scope.$eval(attrs.ngEnter, { event: event });
          });
        }
      });
    }
  };
});

app.filter('html_safe', function($sce) {
  return $sce.trustAsHtml;
});

app.controller('OptionsCtrl', function($scope, $timeout) {
  $scope.output = '';
  $scope.source = background.currentText;
  $scope.rows = 1;

  $scope.resetSource = function() {
    $scope.source = '';
    $scope.output = '';
    background.currentText = '';
  };

  $scope.handleKeydown = function($event) {
    if ($event.keyCode == 27) {
      // 如果内容不为空，按下 ESC，会清空当前内容，否则，关闭窗口
      if (!$scope.source.isBlank()) {
        $event.stopPropagation();
        $event.preventDefault();
        $scope.resetSource();
      }

    } else if ($event.keyCode == 13) {
      $event.stopPropagation();
      $event.preventDefault();

      // 通过 Ctrl+Enter 或者 Cmd+Enter 进行换行
      // 如果仅按下 Enter，提交翻译
      if ($event.metaKey || $event.ctrlKey) {
        document.execCommand('insertText', false, '\n');
      } else {
        $scope.translate($scope.source);
      }
    }
  };

  $scope.handleChange = function($event) {
    if ($scope.source.isBlank()) {
      $scope.resetSource();
    }
  };

  $scope.translate = function(source) {
    if (source) {
      $scope.output = '<div class="loading">正在查询...</div>';

      var message = { type: 'translate', text: source };
      chrome.extension.sendMessage(message, function(response) {
        $scope.$apply(function() {
          $scope.output = response.translation;
        });
      });
    } else {
      $scope.output = '';
    }
  };

  initOptions(function() {
    $scope.translate($scope.source);

    saveOptions(function() {
      chrome.storage.sync.set($scope.options);
    });

    $scope.options = options;
    $scope.$apply();

    for (var name in options) {
      $scope.$watch("options." + name, saveOptions);
    }

    // 这个延时是用于处理 OSX 的弹出窗口动画，该动画有时会导致窗口布局损坏 。
    $timeout(function() {
      $scope.isReady = true;
      angular.element('#source').focus().select();
    }, 200);
  });
});
