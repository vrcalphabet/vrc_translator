import NodeFinder from "./NodeFinder.class.js";
import StyleManager from "./StyleManager.class.js";
import { htmlv, styleString, dataset, repeat } from "./htmlv.js";

class OverlayManager {
  // オーバーレイが表示されているか
  #isShow = false;
  // 作成した要素
  #component = null;
  // 取得したノードたち
  #foundNodes = null;
  // 現在選択されているポップアップの参照ID
  #currentId = null;
  
  constructor() {
    this.#loadStyle();
    this.#createElements();
  }
  
  #createElements() {
    const titleKey = ['XPath', 'textContent', 'title', 'alt', 'placeholder'];
    // TODO: 要素のモジュール化
    const component = htmlv`
      <div class="vrc-overlay" *as="overlay">
        <!-- この要素は「VRChat日本語化アドオン」によって追加されました -->
        <div class="vrc-info" *as="info" *onclick=${e => e.stopPropagation()}>
          <button class="vrc-info__wing" *onclick=${this.changePosition.bind(this)}></button>
          ${repeat(titleKey, key => {
            const tagName = key === 'XPath' ? 'div' : 'textarea';
            return /* html */`
              <div class="vrc-info__box">
                <span class="vrc-info__title">${key}</span>
                <${tagName} class="vrc-info__textarea" readonly ${dataset({ key })} *as="${key}"></${tagName}>
              </div>
            `;
          })}
          <button class="vrc-info__button" *onclick=${this.logElement.bind(this)}>要素をコンソールに表示する</button>
        </div>
      </div>
    `;
    
    document.body.append(component.overlay);

    this.#component = component;
  }
  
  #loadStyle() {
    const styleURL = chrome.runtime.getURL('/styles/style.css');
    StyleManager.loadStyle(styleURL);
  }
  
  #hide() {
    this.#component.overlay.style.display = null;
    this.#isShow = false;
  }
  
  #show() {
    this.#component.overlay.style.display = 'block';
    this.#isShow = true;
  }
  
  #removeAllPopup() {
    const popup = this.#component.overlay.querySelectorAll('.vrc-popup')
    popup.forEach(node => node.remove());
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
    
    this.#component.overlay.append(fragment);
  }
  
  #searchNodes() {
    // 背景要素を表示したままだとelementFromPointが正常に機能しないため一旦隠す
    this.#hide();
    this.#removeAllPopup();
    
    // テキストノードとtitleまたはplaceholder属性がついた要素を検索
    const mainContent = document.querySelector('div#app > main');
    const foundNodes = NodeFinder.findNodes(mainContent);
    this.#foundNodes = foundNodes;
    
    // 検索結果をもとにオーバーレイ画面を作成
    this.#setOverlay(this.#foundNodes);
    this.#show();
  }
  
  #removeHighlight() {
    // 既にハイライトされている要素のハイライトを削除
    const highlightedElement =
      this.#component.overlay.querySelector('.vrc-popup--highlight');
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
    
    // Alt、infoの一時非表示
    if(this.#isShow && e.key === 'Alt') {
      this.#component.info.style.display = 'none';
    }
    
    // Esc
    if(e.key === 'Escape') {
      this.#hide();
    }
    
    // Alt + H
    if(e.key === 'h' && e.altKey) {
      this.#searchNodes();
    }
  }
  
  handleKeyUp(e) {
    // Alt、infoの一時表示
    if(this.#isShow && e.key === 'Alt') {
      this.#component.info.style.display = null;
      e.preventDefault();
    }
  }
  
  handleMouseMove(e) {
    // 背景が表示されている間のみ有効
    if(!this.#isShow) return;
    this.#removeHighlight();
    
    // カーソル上のポップアップを取得
    const target = this.#getPopup(e);
    if(target === null) return;
    
    // ポップアップを白くする
    this.#highlightOverlay(target);
  }
  
  handleClick(e) {
    // 背景が表示されている間のみ有効
    if(!this.#isShow) return;
    
    // カーソル上のポップアップを取得
    const target = this.#getPopup(e);
    if(target === null) return;
    
    const id = target.dataset.index;
    const property = this.#foundNodes[id];
    this.#currentId = id;
    
    const keys = ['XPath', 'textContent', 'title', 'alt', 'placeholder'];
    keys.forEach(key => {
      const name = key === 'XPath' ? 'innerHTML' : 'value';
      let value = property[key];
      
      // 値がない場合はvalueをクリア
      if(value === null) {
        this.#component[key].classList.add('vrc-info__textarea--novalue');
        this.#component[key][name] = '';
        return;
      }
      
      // もし途中に相対パスがある場合、それ以降を強調する置換処理
      if(key === 'XPath') {
        value = value.replace(/^(.+)(?=\/\/)/, '<span class="vrc-info__fade">$1</span>');
      }
      
      this.#component[key].classList.remove('vrc-info__textarea--novalue');
      this.#component[key][name] = value;
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
  
  // 要素をコンソールに出力する
  logElement() {
    if(this.#currentId === null) return;
    
    const target = this.#foundNodes[this.#currentId].target;
    console.log(target);
  }
  
  // info要素の位置を切り替える
  changePosition() {
    this.#component.info.classList.toggle('vrc-info--left');
  }
}

export default OverlayManager;