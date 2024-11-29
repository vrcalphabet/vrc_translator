import XPRParser from "./XPRParser.class.js";

self.addEventListener('activate', async () => {
  // chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  //   if(
  //     changeInfo.status === 'complete' &&
  //     tab.url &&
  //     tab.url.includes('://vrchat.com/home')
  //   ) {
  //     chrome.scripting.executeScript({
  //       target: { tabId: tabId },
  //       files: ['./scripts/import.js']
  //     });
  //   }
  // });

  // const baseURL = chrome.runtime.getURL('/background/background.js');
  // console.log(baseURL);
  // const newURL = new URL('./translations/index.json', baseURL);
  // console.log(newURL);
  // console.log(new URL('./ja.json', newURL));

  const baseURL = chrome.runtime.getURL('/background/background.js');
  const indexURL = new URL('./mapping/index.json', baseURL);
  const result = await (new XPRParser().parse(indexURL));
  console.log(result);
  // chrome.storage.local.set(result);
});