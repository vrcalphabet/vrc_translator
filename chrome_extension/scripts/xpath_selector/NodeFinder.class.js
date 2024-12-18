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
        // existingNodeとnodePropertiesのどちらかtrueの方を採用
        existingNode.title ||= nodeProperties.title;
        existingNode.placeholder ||= nodeProperties.placeholder;
        existingNode.text ||= nodeProperties.text;
      } else {
        // 追加されていない場合、追加する
        nodes.push(nodeProperties);
      }
    };
    
    // 要素が非表示であるかどうかを判定
    const isHidden = (element) => {
      const style = window.getComputedStyle(element);
      return style.display === 'none' ||
             style.visibility === 'hidden' ||
             style.opacity === '0';
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
        
        // テキストが空文字の場合
        if(node.textContent.trim() === '') return true;
        if(isVisuallyHidden(parent)) return;
        
        addNode({
          target: parent,
          title: false,
          placeholder: false,
          text: true
        });
      }
      
      // 要素ノードの場合
      if(node instanceof Element) {
        if(isHidden(node)) return;
        
        // 要素にtitleまたはplaceholder属性がついている場合
        const title = node.getAttribute('title');
        const placeholder = node.getAttribute('placeholder');
        
        if(title || placeholder) {
          if(!isVisuallyHidden(node)) {
            addNode({
              target: node,
              title: title !== null,
              placeholder: placeholder !== null,
              text: false
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
    
    return nodes;
  }
}

export default NodeFinder;