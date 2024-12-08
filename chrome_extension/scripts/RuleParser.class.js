class RuleParser {
  static parseRules(content) {
    const result = [];
  
    function deep(keyStack, obj) {
      const { values, ...keys } = obj;
      
      for(const { xpath, multi, attribute } of values) {
        result.push({
          key: keyStack.join('/'),
          xpath: RuleParser.#normalizeXpath(xpath),
          multi,
          attribute: attribute || null
        });
      }
      
      for(const key in keys) {
        deep(keyStack.concat(key), keys[key]);
      }
    }
    
    deep([], JSON.parse(content));
    return result;
  }
  
  static parseTranslation(content) {
    const result = [];

    function deep(keyStack, obj) {
      if(obj.data === true) {
        const { data, ...temp } = obj;
        const text = keyStack.pop();
        
        result.push({
          key: keyStack.join('/'),
          text, ...temp
        });
        
        return;
      }
      
      for(const key in obj) {
        deep(keyStack.concat(key), obj[key]);
      }
    }

    deep([], JSON.parse(content));
    return result;
  }
  
  // xpathの省略記法を正しい記法に直す
  static #normalizeXpath(xpath) {
    const result = [];
    
    // 識別子と条件で別々のトークンに分ける
    // 'a[b]/c[d]' → ['a', '[b]', '/c', '[d]']
    const tokens = xpath.split(/(\[.+?\])/);
    for(const [i, token] of tokens.entries()) {
      // インデックスが偶数（識別子）の場合
      if(i % 2 === 0) {
        result.push(
          token
          .replaceAll(/#([\w-]+)/g, '[@id="$1"]')
          .replaceAll(/\.([\w-]+)/g, '[contains(concat(" ", normalize-space(@class), " "), " $1 ")]')
        );
      }
      // インデックスが奇数（条件）の場合
      else {
        result.push(
          token
          .replaceAll(/(\d+):(\d+)/g, '(position() >= $1 and position() <= $2)')
          .replaceAll(/(\d+),(\d+)/g, 'position() = $1 or position() = $2')
          .replaceAll(/,(\d+)/g, ' or position() = $1')
          .replaceAll(/(\d+),/g, 'position() = $1 or ')
          .replaceAll(/([\w-]+)\*(\d+)/g, 'count($1) = $2')
        );
      }
    }
    
    return result.join('');
  }
}

export default RuleParser;