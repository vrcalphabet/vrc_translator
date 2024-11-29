// ./modules/index.js 読み込み
const script = document.createElement('script');
script.type = 'module';
script.src = chrome.runtime.getURL('./scripts/modules/index.js');
document.head.append(script);