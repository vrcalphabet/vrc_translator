class ColorConfig {
  static getConfig() {
    return {
      fill: {
        blue: 'rgb(0 128 255 / 30%)',
        lime: 'rgb(64 255 0 / 30%)'
      },
      stroke: {
        blue: 'rgb(0 128 255)',
        lime: 'rgb(64 255 0)'
      }
    }
  }
}

class EventHandler {
  constructor(nodeFinder, overlayManager) {
    this.nodeFinder = nodeFinder;
    this.overlayManager = overlayManager;
    this.initializeEventListener();
  }
  
  initializeEventListener() {
    document.addEventListener('keydown', e => this.handleKeyDown(e));
  }
  
  handleKeyDown(e) {
    // 文書の読み込みがすべて完了しているか
    if(document.readyState !== 'complete') return;
    
    if(e.key === 'Escape') {
      this.overlayManager.hide();
    }
    
    if(e.key === 'h' && e.altKey) {
      this.handleAltH();
    }
  }
  
  handleAltH() {
    this.overlayManager.hide();
    this.overlayManager.reset();
    
    this.nodeFinder.findNodes(document.body);
    const textNodes = this.nodeFinder.getTextNodes();
    const tooltips = this.nodeFinder.getTooltips();
    
    this.overlayManager.setOverlay(tooltips, 'lime');
    this.overlayManager.setOverlay(textNodes, 'blue');
    this.overlayManager.show();
  }
}

class NodeFinder {
  // テキストノードを保持
  #textNodes = [];
  // titleまたはplaceholder属性を保持している要素を保持
  #tooltips = [];
  
  // 可視テキストノードを保持している要素を取得
  findNodes(rootElement) {
    const textNodes = [];
    const tooltips = [];
    
    // 非表示であるかどうかを判定
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
        
        textNodes.push(parent);
      }
      
      // 要素ノードの場合
      if(node instanceof Element) {
        if(isHidden(node)) return;
        
        // 要素にtitleまたはplaceholder属性がついている場合
        const title = node.getAttribute('title');
        const placeholder = node.getAttribute('placeholder');
        
        if(title || placeholder) {
          if(!isVisuallyHidden(node)) {
            tooltips.push(node);
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
    
    // 重複を消した要素配列を割り当て
    this.#textNodes = [...new Set(textNodes)];
    this.#tooltips = [...new Set(tooltips)];
  }
  
  getTextNodes() {
    return this.#textNodes;
  }
  
  getTooltips() {
    return this.#tooltips;
  }
}

class OverlayManager {
  constructor(colors) {
    this.colors = colors;
    this.createElements();
  }
  
  createElements() {
    const cover = document.createElement('div');
    cover.style.cssText = `
      width: 100%;
      height: 100%;
      position: fixed;
      top: 0;
      left: 0;
      display: none;
      background-color: rgba(0 0 0 / 40%);
      z-index: 99999;
    `;
    document.body.append(cover);
    const overlay = document.createElement('div');

    this.cover = cover;
    this.overlay = overlay;
  }
  
  hide() {
    this.cover.style.display = 'none';
  }
  
  show() {
    this.cover.style.display = 'block';
  }
  
  reset() {
    while(this.cover.firstChild) {
      this.cover.firstChild.remove();
    }
  }
  
  setOverlay(nodes, color) {
    const fragment = document.createDocumentFragment();
  
    const baseStyle = `
      position: fixed;
      border: 1px solid ${this.colors.stroke[color]};
      background-color: ${this.colors.fill[color]};
      cursor: pointer;
    `;
    
    for(const node of nodes) {
      const { x, y, width, height } = node.getBoundingClientRect();
      const overlayClone = this.overlay.cloneNode(false);
      
      overlayClone.style.cssText = `
        ${baseStyle};
        left: ${x}px;
        top: ${y}px;
        width: ${width}px;
        height: ${height}px;
      `;
      
      fragment.append(overlayClone);
    }
    
    this.cover.append(fragment);
  }
}

const nodeFinder = new NodeFinder();
const overlayManager = new OverlayManager(ColorConfig.getConfig());
new EventHandler(nodeFinder, overlayManager);