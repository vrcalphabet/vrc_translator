import RuleParser from './RuleParser.class.js';
import PageTranslator from './PageTranslator.class.js';

async function initialize() {
  const { rulesContent, translationContent } = await chrome.storage.local.get(['rulesContent', 'translationContent']);
  const [rules, translations] = [RuleParser.parseRules(rulesContent), RuleParser.parseTranslation(translationContent)];
  
  const pt = new PageTranslator(rules, translations);
  pt.observe();
}

export { initialize };