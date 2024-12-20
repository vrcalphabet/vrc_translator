import NodeFinder from "./NodeFinder.class.js";
import StyleManager from "./StyleManager.class.js";
import { htmlv } from "./htmlv.js";

class OverlayManager {
  // オーバーレイが表示されているか
  #isShow = false;
  // モーダルの背景
  #overlay = null;
  // 要素強調表示用要素
  #popup = null;
  
  constructor() {
    this.#loadStyle();
    this.#createElements();
  }
  
  #createElements() {
    const { overlay, popup, info } = htmlv`
      <div class="vrc-overlay" *as="overlay"></div>
      <div class="vrc-popup" *as="popup"></div>
      <div class="vrc-info" *as="info">
        <div class="vrc-info__left">
          <div class="vrc-info__index vrc-info__index--selected">1</div>
          <div class="vrc-info__index">2</div>
          <div class="vrc-info__index">3</div>
        </div>
        <div class="vrc-info__right">
          <span class="vrc-info__title">textContent</span>
          <textarea class="vrc-info__textarea" readonly>textContent</textarea>
          <span class="vrc-info__title">title</span>
          <textarea class="vrc-info__textarea" readonly>title</textarea>
          <span class="vrc-info__title">placeholder</span>
          <textarea class="vrc-info__textarea" readonly>placeholder</textarea>
        </div>
      </div>
    `;
    document.body.append(overlay);

    this.#overlay = overlay;
    this.#popup = popup;
  }
  
  #loadStyle() {
    const styleURL = chrome.runtime.getURL('/styles/style.css');
    StyleManager.loadStyle(styleURL);
  }
  
  #hide() {
    this.#overlay.style.display = 'none';
    this.#isShow = false;
  }
  
  #show() {
    this.#overlay.style.display = 'block';
    this.#isShow = true;
  }
  
  #reset() {
    while(this.#overlay.firstChild) {
      this.#overlay.firstChild.remove();
    }
  }
  
  #searchNodes() {
    // 背景要素を表示したままだとelementFromPointが正常に機能しないため一旦隠す
    this.#hide();
    this.#reset();
    
    // テキストノードとtitleまたはplaceholder属性がついた要素を検索
    const foundNodes = NodeFinder.findNodes(document.body);
    
    // 検索結果をもとにオーバーレイ画面を作成
    this.#setOverlay(foundNodes);
    this.#show();
  }
  
  #setOverlay(nodes) {
    const fragment = document.createDocumentFragment();
    
    // 各ノードの座標と大きさに合わせてポップアップを複製する
    for(const node of nodes) {
      // titleまたはplaceholder属性を保持している場合は黄緑色、テキストのみを保持している場合は青色
      const color =
        (node.title || node.placeholder) ? 'lime' : 'blue';
      
      const { x, y, width, height } = node.target.getBoundingClientRect();
      const overlayClone = this.#popup.cloneNode(false);
      overlayClone.classList.add(`vrc-popup--${color}`);
      
      overlayClone.style.cssText = `
        left: ${x}px;
        top: ${y}px;
        width: ${width}px;
        height: ${height}px;
      `;
      
      fragment.append(overlayClone);
    }
    
    this.#overlay.append(fragment);
  }
  
  #removeHighlight() {
    // 既にハイライトされている要素のハイライトを削除
    const highlightedElement = this.#overlay.querySelector('.vrc-popup--highlight');
    if(highlightedElement !== null) {
      highlightedElement.classList.remove('vrc-popup--highlight');
    }
  }
  
  #highlightOverlay(element) {
    // ハイライトを追加
    element.classList.add('vrc-popup--highlight');
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
    // 背景が表示されている間のみ有効
    if(!this.#isShow) return;
    this.#removeHighlight();
    
    // カーソル上にある要素を取得
    const target = document.elementFromPoint(e.clientX, e.clientY);
    
    // ポップアップのホバーのみ有効
    if(!target.classList.contains('vrc-popup')) return;
    
    this.#highlightOverlay(target);
  }
  
  handleClick(e) {
    // 背景が表示されている間のみ有効
    if(!this.#isShow) return;
    
    // カーソル上にある要素を取得
    const hoverNodes = document.elementsFromPoint(e.clientX, e.clientY);
    const filterNodes = this.#filterOverlayNodes(hoverNodes);
    this.#removeNotHoveredNode(filterNodes);
  }
  
  #removeNotHoveredNode(nodes) {
    this.#reset();
    this.#overlay.append(...nodes);
  }
  
  #filterOverlayNodes(nodes) {
    // 背景要素のインデックスを取得
    // 背景要素が表示されている時しかこのメソッドは発火しないため、インデックスが-1の場合を考慮する必要はない
    const coverIndex = nodes.findIndex(node => node.className === 'vrc-overlay');
    
    // 背景要素よりも前面のインデックスのみを返す
    return nodes.slice(0, coverIndex);
  }
}

export default OverlayManager;