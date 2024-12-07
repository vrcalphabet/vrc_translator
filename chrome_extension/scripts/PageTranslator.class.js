class PageTranslator {
  #rules;
  #translations;
  #lang;
  
  constructor(rules, translations, lang) {
    this.#rules = rules;
    this.#translations = translations;
    this.#lang = lang;
    console.log(rules, translations);
  }
  
  observe() {
    const config = { childList: true, subtree: true, characterData: true };
    const observer = new MutationObserver(() => this.#domChanged());
    observer.observe(document.body, config);
    this.#domChanged();
  }
  
  #domChanged() {
    const elements = this.#findElements();
    console.log(elements);
  }
  
  #findElements() {
    const result = [];
    for(const rule of this.#rules) {
      const elements = this.#getElements(rule.xpath, rule.multi);
      result.push(...elements);
    }
    
    return result;
  }
  
  #getElements(xpath, multi) {
    const resultType = multi ? XPathResult.ORDERED_NODE_SNAPSHOT_TYPE : XPathResult.FIRST_ORDERED_NODE_TYPE;
    const result = document.evaluate(xpath, document.body, null, resultType, null);
    
    if(multi) {
      const elements = [...Array(result.snapshotLength)].map((_, i) => result.snapshotItem(i));
      return elements;
    } else {
      return [result.singleNodeValue];
    }
  }
}

export default PageTranslator;