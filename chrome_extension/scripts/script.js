async function initialize() {
  // ESModulesに対応するためimport文を使用
  // const translateURL = chrome.runtime.getURL('/scripts/translate.js');
  // const translate = await import(translateURL);
  // translate.initialize();
  
  const xpathSelectorURL = chrome.runtime.getURL('/scripts/xpathSelector.js');
  const xpathSelector = await import(xpathSelectorURL);
  // xpathSelector.initialize();
}

initialize();