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
    this.#replaceTranslation(elements);
  }
  
  #findElements() {
    const result = [];
    for(const rule of this.#rules) {
      const elements = this.#queryElements(rule);
      result.push(...elements);
    }
    
    return result;
  }
  
  #queryElements({ key, xpath, multi, attribute }) {
    const fullXpath = 'div[@id="app"]/main[1]' + xpath;
    
    const resultType = multi ? XPathResult.ORDERED_NODE_SNAPSHOT_TYPE : XPathResult.FIRST_ORDERED_NODE_TYPE;
    const elements = document.evaluate(fullXpath, document.body, null, resultType, null);
    
    const results = [];
    if(multi) {
      for(let i = 0; i < elements.snapshotLength; i++) {
        results.push(elements.snapshotItem(i));
      }
    } else if(elements.singleNodeValue) {
      results.push(elements.singleNodeValue);
    }
    
    return results.map(element => ({
      key,
      target: element,
      attribute
    }));
  }
  
  #replaceTranslation(elements) {
    for(const { key, target, attribute } of elements) {
      let text;
      if(target instanceof Text) {
        text = target.nodeValue;
      } else if(attribute !== null) {
        text = target.getAttribute(attribute);
      } else {
        text = target.innerText;
      }

      const newText = this.#searchTranslations(key, text);
      if(newText === null) continue;
      
      console.log(key, text, newText);
      if(target instanceof Text) {
        target.nodeValue = newText;
      } else if(attribute !== null) {
        target.setAttribute(attribute, newText);
      } else {
        target.innerText = newText;
      }
    }
  }
  
  #searchTranslations(key, text) {
    const findTranslation = this.#translations.find(v =>
      v.key === key && v.text === text.trim()
    );
    
    if(!findTranslation) return null;
    return findTranslation[this.#lang];
  }
}

export default PageTranslator;