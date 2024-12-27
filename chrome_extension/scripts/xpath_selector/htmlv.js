function htmlv(strings, ...args) {
  // 空文字は無効（stringsは最低でも長さ1を取る）
  if(strings.length === 1 && strings[0].trim() === '') return null;
  
  ////////////////////////////////////////////////////////////
  /////                  文字列の正規化                   /////
  ////////////////////////////////////////////////////////////
  
  // コールバック関数とインデックスを保持
  let callbackIndex = 0;
  const callbackFunctions = [];
  
  // 埋め込み用HTMLVElementの一時保存
  let embedIndex = 0;
  const embedElements = [];
  
  // 埋め込み引数(args)を条件に従って処理
  const modifiedArgs = args.map(arg => {
    // htmlvで生成されたDOMを埋め込まれた場合は一旦別タグに変換する
    if(arg instanceof HTMLVElement) {
      embedElements.push(arg);
      return `<template *id="${embedIndex++}"></template>`;
    }
    
    // 引数が文字列の場合は改行をbrタグに変換
    if(typeof arg === 'string') {
      return arg.replaceAll('\n', '<br>');
    }
    
    // 引数が関数の場合はコールバック関数だと判定し、一時配列に追加
    if(arg instanceof Function) {
      callbackFunctions.push(arg);
      return `"${callbackIndex++}"`;
    }
    
    // それ以外の型の引数の場合
    return arg.toString();
  });
  
  ////////////////////////////////////////////////////////////
  /////                   文字列の結合                    /////
  ////////////////////////////////////////////////////////////
  
  // stringとmodifiedArgsを交互に追加した文字列を作成
  const newStrings = [];
  strings.forEach((string, index) => {
    // 現在の文字列を追加
    newStrings.push(string);
    // modifiedArgsの長さはstringsの長さ-1であるため、
    // インデックスがmodifiedArgsの範囲内であれば、対応する引数を追加
    if(index < modifiedArgs.length) {
      newStrings.push(modifiedArgs[index]);
    }
  });
  const newString = newStrings.join('');
  
  ////////////////////////////////////////////////////////////
  /////               文字列からDOMへ変換                 /////
  ////////////////////////////////////////////////////////////
  
  // DOMParserだとscriptタグなどが削除されてしまい、処理に影響を及ぼすのでtemplateタグを使用
  const template = document.createElement('template');
  template.innerHTML = newString;
  const content = template.content;
  
  const embedTemplates = content.querySelectorAll('template[\\*id]');
  embedTemplates.forEach(template => {
    const id = template.getAttribute('*id');
    const embed = embedElements[id];
    // templateの前に埋め込み用要素を入れてtemplateを消すと、置換したように見える
    template.before(embed);
    template.remove();
  });
  
  ////////////////////////////////////////////////////////////
  /////                    ツリー作成                     /////
  ////////////////////////////////////////////////////////////
  
  // DOMから要素変数のツリーを作成
  const elementVariables = generateTree(content);
  
  ////////////////////////////////////////////////////////////
  /////                イベントリスナー設定                /////
  ////////////////////////////////////////////////////////////
  
  // イベントを設定
  const eventNames = EventNameManager.getAllEventName();
  eventNames.forEach(eventName => {
    const fullEventName = '*on' + eventName;
    // 元の文字列にfullEventNameが含まれていない場合は最適化のためにスキップ
    if(!newString.includes(fullEventName)) return;
    
    // 指定されたイベント名に基づいて要素を取得
    content.querySelectorAll(`[\\${fullEventName}]`)
      .forEach(element => {
        // 要素からコールバック関数のインデックスを取得
        const callbackIndex = element.getAttribute(fullEventName);
        // イベントリスナーを追加
        element.addEventListener(eventName, callbackFunctions[callbackIndex]);
        element.removeAttribute(fullEventName);
      });
  });
  
  ////////////////////////////////////////////////////////////
  /////                  要素のフィルター                 /////
  ////////////////////////////////////////////////////////////
  
  // 空文字の削除（フィルター）
  const filteredContent = [...content.childNodes].filter(element => {
    // テキストノードで空文字の場合は消す
    if(element instanceof Text) {
      return element.nodeValue.trim() !== '';
    }
    return true;
  });
  
  // パースした要素をもとにインスタンスを作成
  const result = new HTMLVElement(filteredContent, elementVariables);
  return result;
}

// DOMからツリーを構築する
function generateTree(rootElement) {
  // 要素を再帰的に探索
  function buildTreeStructure(parentNode, element) {
    for(const childElement of element.children) {
      const pathAttribute = childElement.getAttribute('*as');
      
      if(pathAttribute !== null) {
        // *as属性はもう必要ないので削除する
        childElement.removeAttribute('*as');
        // *as属性の値を解析
        const [nodeName, nodeType] = parsePathAttribute(pathAttribute);
        addNodeToTree(parentNode, nodeName, nodeType, childElement);
        continue;
      }
      
      // *as属性が未定義でも子要素にある可能性を考慮し、さらに深く探索
      buildTreeStructure(parentNode, childElement);
    }
  }
  
  // ツリーに新しいノードを追加
  function addNodeToTree(parentNode, nodeName, nodeType, element) {
    const isParentNodeArray = parentNode instanceof HTMLVArray;
    const newNode = createNode(nodeType, element);
    const targetNode = newNode;
    
    // もし配列なら値を追加、連想配列ならキーを追加
    if(isParentNodeArray) {
      parentNode.add(newNode);
    } else {
      // nodeTypeが空（[]ではない）なら値に要素を設定
      // そうでなければ配列や連想配列を設定する
      parentNode.set(nodeName, newNode);
    }
    
    // nodeTypeが空でもさらに探索を続ける
    buildTreeStructure(targetNode, element);
  }
  
  // ノードを作成
  function createNode(nodeType, element) {
    // nodeType（[]かどうか）に基づいて型を設定
    return nodeType === '[]' ?
      new HTMLVArray(element) : new HTMLVObject(element);
  }
  
  // *as属性の値を解析
  function parsePathAttribute(path) {
    return path.split(/(?=\[\])/);
  }
  
  // ベースとなるツリーをもとにDOMを探索
  const tree = new HTMLVObject(null);
  buildTreeStructure(tree, rootElement);
  return tree;
}

// 要素に設定できるすべてのイベント名を取得（webブラウザに依存）
class EventNameManager {
  // イベント名のキャッシュ
  static #eventNameCache = null;
  
  static getAllEventName() {
    // 前回取得しているのなら前回の結果を返す
    if(this.#eventNameCache !== null) {
      return this.#eventNameCache;
    }
    
    const eventNameCache = [];
    const element = document.createElement('div');
    for(const key in element) {
      // プロパティ名の先頭にonがつくものはイベント名
      if(key.startsWith('on')) {
        // "on"を除いたイベント名を取得
        eventNameCache.push(key.slice(2));
      }
    }
    
    // キャッシュを作成
    this.#eventNameCache = eventNameCache;
    return eventNameCache;
  }
}

// HTML要素のコレクション
class HTMLVElement {
  #elements;
  
  // 要素と要素変数を受け取る
  constructor(elements, elementVariables) {
    this.#elements = elements;
    // 要素変数を現在のインスタンスに割り当て
    Object.assign(this, elementVariables);
  }
  
  // #elementsをイテレートできるように
  *[Symbol.iterator]() {
    yield* this.#elements;
  }
  
  // スプレッド構文のメソッド版
  toArray() {
    return [...this];
  }
  
  // toStringしたときに型が分かりやすくなるように
  toString() {
    return '[object HTMLVElement]';
  }
}

class HTMLVObject {
  #target = null;
  
  constructor(target) {
    this.#target = target;
  }
  
  set(key, value) {
    Object.assign(this, { [key]: value })
  }
  
  get TARGET() {
    return this.#target;
  }
  
  // Element.append(HTMLVObjectCollection)に対応するためのメソッド
  toString() {
    return this.TARGET;
  }
}

class Collection {
  #elements = null;
  
  constructor() {
    this.#elements = [];
  }
  
  add(value) {
    this.#elements.push(value);
  }
  
  forEach(callback) {
    this.#elements.forEach(callback);
  }
  
  map(callback) {
    this.#elements.map(callback);
  }
  
  *[Symbol.iterator]() {
    yield* this.#elements;
  }
}

class HTMLVArray extends Collection {
  #target = null;
  
  constructor(target) {
    super();
    this.#target = target;
  }
  
  get TARGET() {
    return this.#target;
  }
  
  // Element.append(HTMLVArrayCollection)に対応するためのメソッド
  toString() {
    return this.TARGET;
  }
}

// テキストをサニタイズする
function sanitizeText(s) {
  return s
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll('\'', '&#39;');
}

// URLをサニタイズする
function sanitizeURI(s) {
  return encodeURIComponent(s);
}

// 属性の値をサニタイズする
function sanitizeAttr(s) {
  return s
    .replaceAll('\\', '\\\\')
    .replaceAll('"', '\\"')
    .replaceAll('\'', '\\\'');
}

// 連想配列で定義されたスタイルを文字列に変換する
function styleString(styles) {
  // 各キーを処理
  const entries = Object.entries(styles).map(([key, value]) => {
    // キーのキャメルケースをケバブケースに変換する
    key = key.replace(/[A-Z]/g, m => '-' + m.toLowerCase());
    
    // もし、値が数値なら末尾にpxを付ける
    if(typeof value === 'number') {
      // 値の小数点3桁以下は影響がないので削除
      value = value.toFixed(2) + 'px';
    }
    
    // キーと値をコロンでつなげる
    return `${key}:${value}`;
  });
  
  // 各スタイルをセミコロンで区切って返す
  return entries.join(';');
}

// データセットを属性文字列に変換する
function dataset(attrs) {
  // 各キーを処理
  const entries = Object.entries(attrs).map(([key, value]) => {
    // キーにdata-の接頭辞を付ける
    key = `data-${key}`;
    
    // String型以外replaceAllメソッドが使えないので一旦文字列に変換する
    value = value.toString();
    
    // サニタイズしてから属性="値"の形式にする
    return `${key}="${sanitizeAttr(value)}"`;
  });
  
  // 各属性をスペースで区切って返す
  return entries.join(' ');
}

// 配列の値によって処理が変わるようなものに使う関数
function repeat(array, callback) {
  const result = array.map(callback);
  return result.join('\n');
}

export { htmlv, sanitizeText, sanitizeURI, sanitizeAttr, styleString, dataset, repeat };