import RuleParser from "./RuleParser.class.js";

self.addEventListener('activate', async () => {
  await saveData();
  console.log('ルールファイルと翻訳ファイルの変換が完了しました');
  
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if(isTabActive(changeInfo, tab)) {
      injection(tabId, rulesContent, translationContent);
    }
  });
});

async function saveData() {
  const rulesContent =
    await fetchAndParse('output/rules.json', RuleParser.parseRules);
  const translationContent =
    await fetchAndParse('output/translations.json', RuleParser.parseTranslation);
  chrome.storage.local.set({
    rulesContent,
    translationContent
  });
}

async function fetchAndParse(url, parser) {
  const resourceURL = chrome.runtime.getURL(url);
  const json = await (await fetch(resourceURL)).json();
  return parser(json);
}

function isTabActive(changeInfo, tab) {
  return (
    changeInfo.status === 'loading' &&
    tab.url &&
    tab.url.includes('://vrchat.com/home')
  );
}

async function injection(tabId) {
  await chrome.scripting.executeScript({
    target: { tabId: tabId },
    files: ['./scripts/PageTranslator.class.js']
  })
  await chrome.scripting.executeScript({
    target: { tabId: tabId },
    func: load
  });
}

function load() {
  const pt = new PageTranslator();
  pt.setConfig();
}