async function initialize() {
  const translateURL = chrome.runtime.getURL('/scripts/translate.js');
  const translate = await import(translateURL);
  translate.initialize();
  
  const xpathSelectorURL = chrome.runtime.getURL('/scripts/xpathSelector.js');
  const xpathSelector = await import(xpathSelectorURL);
  // xpathSelector.initialize();
}

initialize();