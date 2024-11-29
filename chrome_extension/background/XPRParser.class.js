class XPRParser {
  
  async parse(indexURL) {
    let pathMap = {};
    
    // インデックスファイルを取得
    const fileIndex = await this.#fetchJSON(indexURL);
    // const outputFilePath = fileIndex.output;
    for(const filepath of fileIndex.files) {
      const fileContent = await this.#fetchText(new URL(filepath, indexURL));
      
      const tokens = this.tokenize(fileContent);
      const tree = this.buildTree(tokens);
      Object.assign(pathMap, tree.children);
    }
    
    return pathMap;
  }
  
  tokenize(input) {
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
  
  buildTree(tokens) {
    const keyStack = [];
    const xpathStack = [];
    const multiStack = [];
    
    const tree = { values: [], children: {} };
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
  
  #createNewItem(inheritMulti = false) {
    return { key: '', xpath: '', multi: inheritMulti, attribute: ''};
  }
  
  #pushItem(rootTree, path, item) {
    let point = rootTree;
    for(const p of path) {
      if(!(p in point.children)) {
        point.children[p] = { values: [], children: {} };
      }
      point = point.children[p];
    }
    
    point.values.push(item);
  }
  
  async #fetchJSON(url) {
    const res = await fetch(url);
    return await res.json();
  }
  
  async #fetchText(url) {
    const res = await fetch(url);
    return await res.text();
  }
  
}

export default XPRParser;