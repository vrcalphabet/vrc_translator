import NodeFinder from "./NodeFinder.class.js";
import StyleManager from "./StyleManager.class.js";
import { htmlv, styleString } from "./htmlv.js";

class OverlayManager {
  // オーバーレイが表示されているか
  #isShow = false;
  // モーダルの背景
  #overlay = null;
  // 要素の情報表示用要素
  #info = null;
  
  constructor() {
    this.#loadStyle();
    this.#createElements();
  }
  
  #createElements() {
    const titleKey = ['XPath', 'textContent', 'title', 'alt', 'placeholder'];
    const { overlay, info } = htmlv`
      <div class="vrc-overlay" *as="overlay"></div>
      <div class="vrc-info" *as="info">
        <div class="vrc-info__box">
          <span class="vrc-info__title">XPath</span>
          <textarea class="vrc-info__textarea" readonly>XPath</textarea>
        </div>
        <div class="vrc-info__box">
          <span class="vrc-info__title">textContent</span>
          <textarea class="vrc-info__textarea" readonly>textContent</textarea>
        </div>
        <div class="vrc-info__box">
          <span class="vrc-info__title">title</span>
          <textarea class="vrc-info__textarea" readonly>title</textarea>
        </div>
        <div class="vrc-info__box">
          <span class="vrc-info__title">alt</span>
          <textarea class="vrc-info__textarea" readonly>alt</textarea>
        </div>
        <div class="vrc-info__box">
          <span class="vrc-info__title">placeholder</span>
          <textarea class="vrc-info__textarea" readonly>placeholder</textarea>
        </div>
      </div>
    `;
    
    document.body.append(overlay);
    overlay.append(info);

    this.#overlay = overlay;
    this.#info = info;
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
    this.#overlay.querySelectorAll('.vrc-popup')
      .forEach(node => node.remove());
  }
  
  #searchNodes() {
    // 背景要素を表示したままだとelementFromPointが正常に機能しないため一旦隠す
    this.#hide();
    this.#reset();
    
    // テキストノードとtitleまたはplaceholder属性がついた要素を検索
    const foundNodes = NodeFinder.findNodes(document.body);
    console.log(foundNodes);
    
    // 検索結果をもとにオーバーレイ画面を作成
    this.#setOverlay(foundNodes);
    this.#show();
  }
  
  #setOverlay(nodes) {
    const fragment = document.createDocumentFragment();
    
    // 各ノードの座標と大きさに合わせてポップアップを複製する
    nodes.forEach((node, index) => {
      // titleまたはplaceholder、alt属性を保持している場合は黄緑色、テキストのみを保持している場合は青色
      const color =
        (node.title || node.placeholder || node.alt) ? 'lime' : 'blue';
      const style = styleString({
        left: node.x,
        top: node.y,
        width: node.width,
        height: node.height
      });
        
      const popup = htmlv`
        <div class="vrc-popup vrc-popup--${color}" style="${style}" data-index="${index}"></div>
      `;
      
      fragment.append(...popup);
    });
    
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
    const hoverNodes = document.elementFromPoint(e.clientX, e.clientY);
    
    // ポップアップのクリックのみ有効
    if(!hoverNodes.classList.contains('vrc-popup')) return;
    
    console.log(hoverNodes);
  }
}

export default OverlayManager;