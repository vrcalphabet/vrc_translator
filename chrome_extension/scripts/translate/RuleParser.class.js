class RuleParser {
  static parseRules(content) {
    const contents = JSON.parse(content);
    const result = [];
  
    function deep(temp, keyStack, obj) {
      const { values, ...keys } = obj;
      
      for(const { xpath, multi, attribute } of values) {
        temp.push({
          key: keyStack.join('/'),
          xpath: RuleParser.#normalizeXpath(xpath),
          multi,
          attribute: attribute || null
        });
      }
      
      for(const key in keys) {
        deep(temp, keyStack.concat(key), keys[key]);
      }
    }
    
    for(const content of contents) {
      const { rootkey, includes, excludes, ...keys } = content;
      const temp = {
        includes: includes.map(rule => new RegExp(rule.replaceAll('*', '.*'))),
        excludes: excludes.map(rule => new RegExp(rule.replaceAll('*', '.*'))),
        values: []
      };
      deep(temp.values, [rootkey], keys);
      result.push(temp);
    }
    
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
          // #id記法を属性記法に変換
          .replaceAll(/#([\w-]+)/g, '[@id="$1"]')
          // .class記法を属性記法に変換
          .replaceAll(/\.([\w-]+)/g, '[contains(concat(" ", normalize-space(@class), " "), " $1 ")]')
        );
      }
      // インデックスが奇数（条件）の場合
      else {
        result.push(
          token
          // インデックス範囲指定を正しい記法に変換
          .replaceAll(/(\d+):(\d+)/g, '(position() >= $1 and position() <= $2)')
          // インデックス複数指定を正しい記法に変換
          .replaceAll(/(\d+),(\d+)/g, 'position() = $1 or position() = $2')
          .replaceAll(/,(\d+)/g, ' or position() = $1')
          .replaceAll(/(\d+),/g, 'position() = $1 or ')
        );
      }
    }
    
    return result.join('');
  }
}

export default RuleParser;