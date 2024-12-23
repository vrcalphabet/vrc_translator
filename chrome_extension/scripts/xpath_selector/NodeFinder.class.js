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
      
      // 要素が小さい場合
      if (width <= 10 || height <= 10) return true;
      
      // 要素の上に別の要素が重なっているかどうかを判定
      const midX = left + width / 2;
      const midY = top + height / 2;
      const topElement = document.elementFromPoint(midX, midY);
      return topElement === null || !element.contains(topElement);
    };
    
    // 除外するタグ
    const excludedTags = new Set(['BR', 'IFRAME', 'IMG', 'INPUT', 'NOSCRIPT', 'SCRIPT', 'SVG']);
    
    function traverse(node) {
      // テキストノードの場合
      if(node instanceof Text) {
        const parent = node.parentElement;
        const text = node.textContent.trim();
        
        // テキストが空文字の場合
        if(text === '') return;
        if(isVisuallyHidden(parent));
        
        addNode({
          target: node,
          title: null,
          placeholder: null,
          alt: null,
          text: text
        });
      }
      
      // 要素ノードの場合
      if(node instanceof Element) {
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
              title: title,
              placeholder: placeholder,
              alt: alt,
              text: null
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
    
    this.setSize(nodes);
    return nodes;
  }
  
  // 要素の位置を幅の情報を追加
  static setSize(nodes) {
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
}

export default NodeFinder;