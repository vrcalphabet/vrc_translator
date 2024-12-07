import RuleParser from "./RuleParser.class.js";
import PageTranslator from "./PageTranslator.class.js";

async function initialize() {
  const content = await chrome.storage.local.get(['rulesContent', 'translationContent']);
  console.log(content);
}

export { initialize };