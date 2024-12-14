import RuleParser from './RuleParser.class.js';
import PageTranslator from './PageTranslator.class.js';

async function initialize() {
  const { rulesContent, translationContent } = await chrome.storage.local.get(['rulesContent', 'translationContent']);
  const rules        = RuleParser.parseRules(rulesContent);
  const translations = RuleParser.parseTranslation(translationContent);
  
  const pageTranslator = new PageTranslator(rules, translations, 'ja-jp');
  pageTranslator.observe();
}

export { initialize };