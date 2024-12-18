import NodeFinder from "./NodeFinder.class.js";
import StyleManager from "./StyleManager.class.js";

class OverlayManager {
  #isShow = false;
  #cover = null;
  #overlay = null;
  
  constructor() {
    this.#setStyle();
    this.#createElements();
  }
  
  #createElements() {
    // 最前面表示用要素
    const cover = document.createElement('div');
    cover.className = 'vrc-translator__cover';
    document.body.append(cover);
    
    // クローン前提要素
    const overlay = document.createElement('div');
    overlay.className = 'vrc-translator__overlay';

    this.#cover = cover;
    this.#overlay = overlay;
  }
  
  #setStyle() {
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
  
  #hide() {
    this.#cover.style.display = 'none';
    this.#isShow = false;
  }
  
  #show() {
    this.#cover.style.display = 'block';
    this.#isShow = true;
  }
  
  #reset() {
    this.#hide();
    while(this.#cover.firstChild) {
      this.#cover.firstChild.remove();
    }
  }
  
  #searchNodes() {
    // cover要素を表示したままだとelementFromPointが正常に機能しないため一旦隠す
    this.#reset();
    
    // テキストノードとtitleまたはplaceholder属性がついた要素を検索
    const foundNodes = NodeFinder.findNodes(document.body);
    
    // 検索結果をもとにオーバーレイ画面を作成
    this.#setOverlay(foundNodes);
    this.#show();
  }
  
  #setOverlay(nodes) {
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
  
  #removeHighlight() {
    // 既にハイライトされている要素のハイライトを削除
    const highlightedElement = this.#cover.querySelector('.vrc-translator__overlay--highlight');
    if(highlightedElement !== null) {
      highlightedElement.classList.remove('vrc-translator__overlay--highlight');
    }
  }
  
  #highlightOverlay(element) {
    // ハイライトを追加
    element.classList.add('vrc-translator__overlay--highlight');
  }
  
  handleKeyDown(e) {
    // 文書の読み込みがすべて完了しているか
    if(document.readyState !== 'complete') return;
    
    // Esc
    if(e.key === 'Escape') {
      this.#hide();
    }
    
    // Alt + H
    if(e.key === 'h' && e.altKey) {
      this.#searchNodes();
    }
  }
  
  handleMouseMove(e) {
    // coverが表示されている間のみ有効
    if(!this.#isShow) return;
    this.#removeHighlight();
    
    // カーソル上にある要素を取得
    const target = document.elementFromPoint(e.clientX, e.clientY);
    
    // オーバーレイのホバーのみ有効
    if(!target.classList.contains('vrc-translator__overlay')) return;
    
    this.#highlightOverlay(target);
  }
  
  handleClick(e) {
    // coverが表示されている間のみ有効
    if(!this.#isShow) return;
    
    // カーソル上にある要素を取得
    const hoverNodes = document.elementsFromPoint(e.clientX, e.clientY);
    console.log(this.#filterOverlayNodes(hoverNodes));
  }
  
  #filterOverlayNodes(nodes) {
    // カバー要素のインデックスを取得
    // カバー要素が表示されている時しかこのメソッドは発火しないため、インデックスが-1の場合を考慮する必要はない
    const coverIndex = nodes.findIndex(node => node.className === 'vrc-translator__cover');
    
    // カバー要素よりも前のインデックスのみを返す
    return nodes.slice(0, coverIndex);
  }
}

export default OverlayManager;