class XPRParser {
  
  static parse(content) {
    const tokens = this.#tokenize(content);
    const tree = this.#buildTree(tokens);
    
    return tree;
  }
  
  static #tokenize(input) {
    const lines = input.split('\n');
    const tokens = [];
    
    for(let line of lines) {
      // インデントとコメントを消す
      line = line.replace(/%.*/, '').trim();
      
      // 空行の場合はスキップ
      if(line.length === 0) {
        continue;
      }
      
      // トークンに分割して配列に追加
      const splitTokens = line.split(' ');
      tokens.push(...splitTokens);
      
      // ネスト記号ではない場合
      if(
        splitTokens[splitTokens.length - 1] !== '{' &&
        splitTokens[0] !== '}'
      ) {
        // 行の区切りを表す記号を追加
        tokens.push(',');
      }
    }
    
    return tokens;
  }
  
  static #buildTree(tokens) {
    const keyStack = [];
    const xpathStack = [];
    const multiStack = [];
    
    const tree = { values: [] };
    let itemData = this.#createNewItem();
    
    for(const token of tokens) {
      // キートークン
      if(token.match(/^[A-Z]/)) {
        itemData.key = token;
      }
      // xpathトークン
      if(token.startsWith('/')) {
        itemData.xpath = token;
      }
      // マルチ要素トークン
      if(token === '*') {
        itemData.multi = true;
      }
      // 属性トークン
      if(token.match(/^\[[a-zA-Z0-9-]+\]$/)) {
        itemData.attribute = token.slice(1, -1);
      }
      // ネスト開始トークン
      if(token === '{') {
        keyStack.push(itemData.key);
        xpathStack.push(itemData.xpath);
        multiStack.push(itemData.multi);
        itemData = this.#createNewItem(itemData.multi);
      }
      // ネスト終了トークン
      if(token === '}') {
        keyStack.pop();
        xpathStack.pop();
        multiStack.pop();
      }
      // 区切りトークン
      if(token === ',') {
        const path = keyStack.concat(itemData.key).filter(v => v);
        const item = {
          xpath: xpathStack.concat(itemData.xpath).join(''),
          multi: itemData.multi || multiStack[multiStack.length - 1],
          attribute: itemData.attribute
        };
        this.#pushItem(tree, path, item);
        
        itemData = this.#createNewItem();
      }
    }
    
    return tree;
  }
  
  static #createNewItem(inheritMulti = false) {
    return { key: '', xpath: '', multi: inheritMulti, attribute: ''};
  }
  
  static #pushItem(rootTree, path, item) {
    let point = rootTree;
    for(const p of path) {
      if(!(p in point)) {
        point[p] = { values: [] };
      }
      point = point[p];
    }
    
    point.values.push(item);
  }
  
}

module.exports = XPRParser;