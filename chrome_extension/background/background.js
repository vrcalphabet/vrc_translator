import RuleParser from "./RuleParser.class.js";

self.addEventListener('activate', async () => {
  
  const [mappingContent, translationContent] = await Promise.all([
    fetchAndParse('mapping/output.json', RuleParser.parseXPR),
    fetchAndParse('translations/output.json', RuleParser.parseTranslation)
  ]);
  
  console.log('ルールファイルと翻訳ファイルの変換が完了しました');
  
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if(
      changeInfo.status === 'loading' &&
      tab.url &&
      tab.url.includes('://vrchat.com/home')
    ) {
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['./scripts/PageTranslator.class.js']
      }).then(() => {
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          func: load,
          args: [mappingContent, translationContent]
        });
      });
    }
  });
});

async function fetchAndParse(url, parser) {
  const resourceURL = chrome.runtime.getURL(url);
  const json = await (await fetch(resourceURL)).json();
  return parser(json);
}

function load(mappingContent, translationContent) {
  const pt = new PageTranslator();
  pt.setConfig(mappingContent, translationContent);
}