chrome.alarms.create('keepAlive', {
  periodInMinutes: 0.25
});

chrome.alarms.onAlarm.addListener(alarm => {
  if(alarm.name === 'keepAlive') {
    chrome.runtime.getPlatformInfo();
  }
});

chrome.runtime.onStartup.addListener(initialize);
self.addEventListener('activate', initialize);

async function initialize() {
  await saveData();
  console.log('ルールファイルと翻訳ファイルの変換が完了しました');
  
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if(isTabActive(changeInfo, tab)) {
      injection(tabId);
    }
  });
}

async function saveData() {
  const rulesContent = await fetchContent('/output/rules.json');
  const translationContent = await fetchContent('/output/translations.json');
  chrome.storage.local.set({
    rulesContent,
    translationContent
  });
}

async function fetchContent(url) {
  const resourceURL = chrome.runtime.getURL(url);
  const content = await (await fetch(resourceURL)).text();
  return content;
}

function isTabActive(changeInfo, tab) {
  return (
    changeInfo.status === 'loading' &&
    tab.url &&
    tab.url.includes('://vrchat.com/home')
  );
}

function injection(tabId) {
  console.log('injection');
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    files: ['/scripts/script.js']
  });
}