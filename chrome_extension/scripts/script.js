async function initialize() {
  const scriptURL = chrome.runtime.getURL('/scripts/translate.js');
  const script = await import(scriptURL);
  script.initialize();
}

initialize();