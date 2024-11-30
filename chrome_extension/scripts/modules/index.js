import PageTranslator from './PageTranslator.class.js';

(async () => {
  console.log('Module loaded!');

  const xpathRuleURL = chrome.runtime.getURL('mapping/output.json');
  console.log(xpathRuleURL);
  const res = await fetch(xpathRuleURL);
  const xpathRule = await res.json();
  console.log(xpathRule);

  // const pt = new PageTranslator();
})();
