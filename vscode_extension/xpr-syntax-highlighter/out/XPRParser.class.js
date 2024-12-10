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
    let rootKey;
    const keyStack = [];
    const xpathStack = [];
    const multiStack = [];
    const includes = [];
    const excludes = [];
    
    let isRootKeyToken = false;
    let isIncludesBlock = false;
    let isExcludesBlock = false;
    let tempString;
    
    const tree = { values: [] };
    let itemData = this.#createNewItem();
    
    for(const token of tokens) {
      // rootkeyブロック
      if(isRootKeyToken) {
        if(token === ',') {
          rootKey = tempString;
          
          tree[rootKey] = {};
          Object.assign(tree[rootKey], {
            includes, excludes
          });
          
          isRootKeyToken = false;
        } else {
          tempString = token;
        }
        continue;
      }
      // includesブロック内
      if(isIncludesBlock) {
        if(token === '}') {
          isIncludesBlock = false;
        } else if(token.startsWith('/')) {
          tempString = token;
        } else if(token === ',') {
          includes.push(tempString);
        }
        continue;
      }
      // excludesブロック内
      if(isExcludesBlock) {
        if(token === '}') {
          isExcludesBlock = false;
        } else if(token.startsWith('/')) {
          tempString = token;
        } else if(token === ',') {
          excludes.push(tempString);
        }
        continue;
      }
      
      // rootkeyトークン
      if(token === '@rootkey') {
        isRootKeyToken = true;
      }
      // includesトークン
      if(token === '@includes') {
        isIncludesBlock = true;
      }
      // excludesトークン
      if(token === '@excludes') {
        isExcludesBlock = true;
      }
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
        this.#pushItem(tree, rootKey, path, item);
        
        itemData = this.#createNewItem();
      }
    }
    
    return tree;
  }
  
  static #createNewItem(inheritMulti = false) {
    return { key: '', xpath: '', multi: inheritMulti, attribute: ''};
  }
  
  static #pushItem(rootTree, rootKey, path, item) {
    let point = rootTree[rootKey];
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