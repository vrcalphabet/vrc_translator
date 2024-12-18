(() => {
  // ESモジュールに対応するための処理
  const importURL = chrome.runtime.getURL('/scripts/import.js');
  import(importURL);
})();