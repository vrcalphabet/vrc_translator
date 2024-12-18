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
    // 現在のURLに基づいてxpath配列をフィルター
    const xpathRules = this.#filterXpathRules();
    // xpathを使って要素を取得する
    const elements = this.#findElements(xpathRules);
    console.log(elements);
    // 要素のテキストやtitle, placeholderを翻訳
    this.#replaceTranslation(elements);
  }
  
  #filterXpathRules() {
    // 末尾にスラッシュがある場合はスラッシュを消す
    const fullPath = location.pathname.replace(/\/$/, '');
    
    const result = [];
    for(const rule of this.#rules) {
      if(this.#isIncluded(fullPath, rule)) {
        result.push(...rule.values);
      }
    }
    
    return result;
  }

  #isIncluded(fullPath, rule) {
    const isIncludedPath = rule.includes.some(includePath => includePath.test(fullPath));
    const isExcludedPath = rule.excludes.some(excludePath => excludePath.test(fullPath));
    
    return isIncludedPath && !isExcludedPath;
  }
  
  #findElements(xpathRules) {
    const result = [];
    for(const rule of xpathRules) {
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
  
  // 翻訳データが存在するか確認
  // 存在する場合は翻訳後の文字列、存在しない場合はnullを返す
  #searchTranslations(key, text) {
    const findTranslation = this.#translations.find(v =>
      v.key === key && v.text === text.trim()
    );
    
    if(!findTranslation) return null;
    return findTranslation[this.#lang];
  }
}

export default PageTranslator;