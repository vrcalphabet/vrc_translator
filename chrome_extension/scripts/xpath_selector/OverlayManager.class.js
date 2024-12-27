import NodeFinder from "./NodeFinder.class.js";
import StyleManager from "./StyleManager.class.js";
import { htmlv, styleString, dataset } from "./htmlv.js";

class OverlayManager {
  // オーバーレイが表示されているか
  #isShow = false;
  // モーダルの背景
  #overlay = null;
  // 要素の情報表示用要素
  #info = null;
  // 取得したノードたち
  #foundNodes = null;
  
  constructor() {
    this.#loadStyle();
    this.#createElements();
  }
  
  #createElements() {
    const titleKey = ['XPath', 'textContent', 'title', 'alt', 'placeholder'];
    const { overlay, info } = htmlv`
      <div class="vrc-overlay" *as="overlay"></div>
      <div class="vrc-info" *as="info[]">
        ${repeat(titleKey, key => {
          return /* html */`
            <div class="vrc-info__box">
              <span class="vrc-info__title">XPath</span>
              <textarea class="vrc-info__textarea" readonly ${dataset({ key })} *as=""></textarea>
            </div>
          `;
        })}
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
      
      const datasetIndex = dataset({ index });
        
      const popup = htmlv`
        <div class="vrc-popup vrc-popup--${color}" style="${style}" ${datasetIndex}></div>
      `;
      
      fragment.append(...popup);
    });
    
    this.#overlay.append(fragment);
  }
  
  #searchNodes() {
    // 背景要素を表示したままだとelementFromPointが正常に機能しないため一旦隠す
    this.#hide();
    this.#reset();
    
    // テキストノードとtitleまたはplaceholder属性がついた要素を検索
    const foundNodes = NodeFinder.findNodes(document.body);
    this.#foundNodes = foundNodes;
    console.log(this.#foundNodes);
    
    // 検索結果をもとにオーバーレイ画面を作成
    this.#setOverlay(this.#foundNodes);
    this.#show();
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
    
    const target = this.#getPopup(e);
    if(target === null) return;
    
    this.#highlightOverlay(target);
  }
  
  handleClick(e) {
    // 背景が表示されている間のみ有効
    if(!this.#isShow) return;
    
    const target = this.#getPopup(e);
    if(target === null) return;
    
    console.log(target);
    console.log(this.#info);
    
    const id = target.dataset.index;
    const property = this.#foundNodes[id];
    
    const keys = ['textContent', 'title', 'alt', 'placeholder'];
    keys.forEach(key => {
      this.#info[key].value = property[key];
    });
  }
  
  // カーソル座標上にある複数のポップアップのうち、一番大きさが小さいものを選ぶ
  #getPopup(event) {
    // カーソル上にある要素をすべて選択
    const elements = document.elementsFromPoint(event.clientX, event.clientY);
    
    // ポップアップ要素のみ選択する
    const filteredElements = elements.filter(element => element.classList.contains('vrc-popup'));
    
    if(filteredElements.length === 0) return null;
    
    // 各要素の面積を計算する
    // TODO: 面積の計算をあらかじめキャッシュする
    const areas = filteredElements.map(element => {
      const client = element.getBoundingClientRect();
      const { width, height } = client;
      return {
        target: element,
        area: width * height
      };
    });
    
    // 面積が最小の要素を選択
    const smallestElement = areas.reduce((min, current) => {
      return (current.area < min.area) ? current : min;
    });

    return smallestElement.target;
  }
}

export default OverlayManager;