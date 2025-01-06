class NodeFinder {
  // 可視テキストノードを保持している要素を取得
  static findNodes(rootElement) {
    const nodes = [];
    
    // nodesに要素を追加する
    const addNode = (nodeProperties) => {
      // 既に要素が追加されているか
      const existingNode = nodes.find(node => node.target === nodeProperties.target);
      
      if(existingNode !== undefined) {
        // 追加されている場合、既存のプロパティを更新
        // nodePropertiesに値があればそれを採用、なければ更新しない
        existingNode.title = nodeProperties.title || existingNode.title;
        existingNode.placeholder = nodeProperties.placeholder || existingNode.placeholder;
        existingNode.text = nodeProperties.text || existingNode.text;
      } else {
        // 追加されていない場合、新しく追加する
        nodes.push(nodeProperties);
      }
    };
    
    // 要素が非表示であるかどうかを判定
    const isHidden = (element) => {
      const style = window.getComputedStyle(element);
      return style.display === 'none' ||
             style.visibility === 'hidden'
    };
    
    // 要素が視覚的に隠れているかを判定
    const isVisuallyHidden = (element) => {
      const { left, top, width, height } = element.getBoundingClientRect();
      
      // 要素の上に別の要素が重なっているかどうかを判定
      const midX = left + width / 2;
      const midY = top + height / 2;
      const topElement = document.elementFromPoint(midX, midY);
      return topElement === null || !element.contains(topElement);
    };
    
    // 除外するタグ
    // ※svg要素のみタグ名は小文字で扱われるため小文字にしている
    const excludedTags = new Set(['BR', 'IFRAME', 'IMG', 'INPUT', 'NOSCRIPT', 'SCRIPT', 'TEXTAREA', 'svg']);
    
    const traverse = (node) => {
      // テキストノードの場合
      if(node instanceof Text) {
        const parent = node.parentElement;
        const text = node.textContent.trim().replaceAll('\n', '\\n');
        
        // テキストが空文字の場合
        if(text === '') return;
        if(isVisuallyHidden(parent)) return;
        
        // テキストノード一つしかない場合は親をターゲットにする
        if(parent.childNodes.length === 1) {
          node = parent;
        }
        
        addNode({
          target: node,
          XPath: this.#getXPath(node),
          title: null,
          placeholder: null,
          alt: null,
          textContent: text
        });
      }
      // 要素ノードの場合
      else if(node instanceof Element) {
        if(isHidden(node)) return;
        
        // 要素にtitleまたはplaceholder、alt属性がついている場合
        const title = node.getAttribute('title');
        const placeholder = node.getAttribute('placeholder');
        const alt = node.getAttribute('alt');
        
        if(title || placeholder || alt) {
          if(!isVisuallyHidden(node)) {
            // 属性の値が設定されていない場合は自動的にnullになるので、nullを考慮する必要はない
            addNode({
              target: node,
              XPath: this.#getXPath(node),
              title: title,
              placeholder: placeholder,
              alt: alt,
              textContent: null
            });
          }
        }
        
        // 特定のタグは探索を除外
        if(excludedTags.has(node.tagName)) return;
        
        // 子ノードを再帰的に探索
        for(const child of node.childNodes) {
          traverse(child);
        }
      }
    }
    
    // 要素を再帰的に探索
    traverse(rootElement);
    
    this.#setSize(nodes);
    return nodes;
  }
  
  // 要素の位置を幅の情報を追加
  static #setSize(nodes) {
    // テキストノードの位置と幅を取得
    const getTextNodeSize = (node) => {
      const range = document.createRange();
      range.selectNodeContents(node);
      const rects = range.getClientRects();
      const rectsList = [...rects];
      
      if(rectsList.length > 0) {
        // 複数行にまたがっている場合、rectsはその行分の長さを返すので、
        // 各プロパティ位置と大きさからテキストノード全体の位置と大きさを求める
        
        // x1, y1 = ノードの左上 | x2, y2 = ノードの右下
        const x1List = rectsList.map(rect => rect.x);
        const y1List = rectsList.map(rect => rect.y);
        const x2List = rectsList.map(rect => rect.x + rect.width);
        const y2List = rectsList.map(rect => rect.y + rect.height);
        
        // x1とy2の最小値（一番左上の座標）を求める
        const x1 = Math.min(...x1List);
        const y1 = Math.min(...y1List);
        
        // x2とy2の最大値（一番右下の座標）を求める
        const x2 = Math.max(...x2List);
        const y2 = Math.max(...y2List);
        
        // テキストノード全体の位置と大きさを求める
        const x = x1;
        const y = y1;
        const width = x2 - x1;
        const height = y2 - y1;
        
        return { x, y, width, height };
      }
      
      return null;
    };
    
    // 要素の位置と幅を取得
    const getElementSize = (node) => {
      const client = node.getBoundingClientRect();
      return client;
    };
    
    for(const node of nodes) {
      let size;
      if(node.target instanceof Text) {
        size = getTextNodeSize(node.target);
      } else {
        size = getElementSize(node.target);
      }
      
      const { x, y, width, height } = size;
      Object.assign(node, { x, y, width, height });
    }
  }
  
  // xprで使うxpathを取得
  static #getXPath(target) {
    // ルート(body/div#main/main)からターゲットまでの要素をリスト
    const nodeTree = [];
    while(target.tagName !== 'MAIN') {
      nodeTree.unshift(target);
      target = target.parentElement;
    }
    
    // ルートからターゲットまでの要素のxpathを構築する
    const result = [];
    let current = document.querySelector('main');
    for(const node of nodeTree) {
      // ノードがテキストノードの場合
      if(node instanceof Text) {
        // 現在のノードと同じ階層にいるテキストノードをすべて取得
        const childTextNodes = getChildTextNodes(node.parentElement);
        // その中で自分は何番目に存在するかを取得
        const index = childTextNodes.indexOf(node);
        // パスの追加（/text()[要素位置]）
        // xpathの場合インデックスは1始まりなので1加算する
        result.push(`/text()[${index + 1}]`);
        
        // テキストノードの子は存在しないのでここで終了
        break;
      }
      
      const tagName = node.tagName.toLowerCase();
      
      if(node.id) {
        // パスの追加（//タグ名#ID）
        result.push(`//${tagName}#${node.id}`);
      } else {
        // 識別子クラスがある場合はそれを付与したうえで検索
        // ない場合はutilClassNameは空文字のためタグ名のみで検索できる
        const utilClassName = getUtilClassName(node);
        const children = current.querySelectorAll(`:scope > ${tagName}${utilClassName}`);
        
        // 要素の位置を取得する
        const index = [...children].indexOf(node);
        // パスの追加（/タグ名.クラス名[要素位置]）
        // xpathの場合インデックスは1始まりなので1加算する
        result.push(`/${tagName}${utilClassName}[${index + 1}]`);
        
      }
      
      current = node;
    }
  
    return result.join('');
  
    // 識別子クラス（例: .e1buxcrw1）を取得する関数
    function getUtilClassName(node) {
      // 識別子クラスはeで始まり英数字が続き数字で終わる
      const classNamePattern = /^e[a-z0-9]+\d$/;
      
      // 要素のクラスリストを取得し、識別子クラスを検索する
      const classNames = [...node.classList];
      const utilClassName = classNames.find(name => classNamePattern.test(name));
      
      // 識別子クラスがある場合は先頭にピリオドを付けて返す
      if(utilClassName) return '.' + utilClassName;
      // ない場合は空文字を返す
      return '';
    }
    
    // 要素の子のテキストノードをすべて取得する
    function getChildTextNodes(node) {
      return [...node.childNodes].filter(node => node instanceof Text);
    }
  }
}

export default NodeFinder;