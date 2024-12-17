class EventHandler {
  #nodeFinder = null;
  #overlayManager = null;
  
  constructor(nodeFinder, overlayManager) {
    this.#nodeFinder = nodeFinder;
    this.#overlayManager = overlayManager;
    this.#overlayManager.setStyle();
    this.initializeEventListener();
  }
  
  initializeEventListener() {
    document.addEventListener('keydown', e => this.handleKeyDown(e));
    document.addEventListener('mousemove', e => this.handleMouseMove(e));
  }
  
  handleKeyDown(e) {
    // 文書の読み込みがすべて完了しているか
    if(document.readyState !== 'complete') return;
    
    // Esc
    if(e.key === 'Escape') {
      this.#overlayManager.hide();
    }
    
    // Alt + H
    if(e.key === 'h' && e.altKey) {
      this.handleAltH();
    }
  }
  
  handleAltH() {
    // cover要素を表示したままだとelementFromPointが正常に機能しないため一旦隠す
    this.#overlayManager.hide();
    this.#overlayManager.reset();
    
    // テキストノードとtitleまたはplaceholder属性がついた要素を検索
    this.#nodeFinder.findNodes(document.body);
    
    // 検索結果をもとにオーバーレイ画面を作成
    const foundNodes = this.#nodeFinder.getNodes();
    this.#overlayManager.setOverlay(foundNodes);
    this.#overlayManager.show();
  }
  
  handleMouseMove(e) {
    this.#overlayManager.handleMouseMove(e);
  }
}

class NodeFinder {
  #foundNodes = [];
  
  // 可視テキストノードを保持している要素を取得
  findNodes(rootElement) {
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
    
    this.#foundNodes = nodes;
    console.log(nodes);
  }
  
  getNodes() {
    return this.#foundNodes;
  }
}

class OverlayManager {
  #isShow = false;
  #cover = null;
  #overlay = null;
  
  constructor() {
    this.createElements();
    document.body.append(this.#cover);
  }
  
  createElements() {
    const cover = document.createElement('div');
    cover.className = 'vrc-translator__cover';
    
    const overlay = document.createElement('div');
    overlay.className = 'vrc-translator__overlay';

    this.#cover = cover;
    this.#overlay = overlay;
  }
  
  setStyle() {
    StyleManager.addStyle(`
      .vrc-translator__cover {
        width: 100%;
        height: 100%;
        position: fixed;
        top: 0;
        left: 0;
        display: none;
        background-color: rgba(0 0 0 / 40%);
        z-index: 99999;
      }
      .vrc-translator__overlay {
        position: fixed;
        cursor: pointer;
        border: 1px solid transparent;
      }
      .vrc-translator__overlay--blue {
        background-color: rgb(0 128 255 / 30%);
        border-color: rgb(0 128 255);
      }
      .vrc-translator__overlay--lime {
        background-color: rgb(64 255 0 / 30%);
        border-color: rgb(64 255 0);
      }
      .vrc-translator__overlay--highlight {
        border-color: rgb(255 255 255);
        background-color: rgb(255 255 255 / 30%);
      }
    `);
  }
  
  hide() {
    this.#cover.style.display = 'none';
    this.#isShow = false;
  }
  
  show() {
    this.#cover.style.display = 'block';
    this.#isShow = true;
  }
  
  reset() {
    while(this.#cover.firstChild) {
      this.#cover.firstChild.remove();
    }
  }
  
  setOverlay(nodes) {
    const fragment = document.createDocumentFragment();
    
    // 各ノードの座標と大きさに合わせてオーバーレイを複製する
    for(const node of nodes) {
      // titleまたはplaceholder属性を保持している場合は黄緑色、テキストのみを保持している場合は青色
      const color =
        (node.title || node.placeholder) ? 'lime' : 'blue';
      
      const { x, y, width, height } = node.target.getBoundingClientRect();
      const overlayClone = this.#overlay.cloneNode(false);
      overlayClone.classList.add(`vrc-translator__overlay--${color}`);
      
      overlayClone.style.cssText = `
        left: ${x}px;
        top: ${y}px;
        width: ${width}px;
        height: ${height}px;
      `;
      
      fragment.append(overlayClone);
    }
    
    this.#cover.append(fragment);
  }
  
  handleMouseMove(e) {
    // coverが表示されている間のみ有効
    if(!this.#isShow) return;
    this.removeHighlight();
    
    // カーソル上にある要素を取得
    const { clientX, clientY } = e;
    const target = document.elementFromPoint(clientX, clientY);
    
    // オーバーレイのホバーのみ有効
    if(!target.classList.contains('vrc-translator__overlay')) return;
    
    this.highlightOverlay(target);
  }
  
  removeHighlight() {
    // 既にハイライトされている要素のハイライトを削除
    const highlightedElement = this.#cover.querySelector('.vrc-translator__overlay--highlight');
    if(highlightedElement !== null) {
      highlightedElement.classList.remove('vrc-translator__overlay--highlight');
    }
  }
  
  highlightOverlay(element) {
    // ハイライトを追加
    element.classList.add('vrc-translator__overlay--highlight');
  }
}

class StyleManager {
  static addStyle(content) {
    const style = document.createElement('style');
    style.textContent = content;
    document.head.append(style);
  }
}

const nodeFinder = new NodeFinder();
const overlayManager = new OverlayManager();
new EventHandler(nodeFinder, overlayManager);