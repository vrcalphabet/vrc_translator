function htmlv(strings, ...args) {
  // 空文字は無効（stringsは最低でも長さ1を取る）
  if(strings.length === 1 && strings[0].trim() === '') return null;
  
  // コールバック関数とインデックスを保持
  let callbackIndex = 0;
  const callbackFunctions = [];
  
  // 埋め込み引数(args)を条件に従って処理
  const modifiedArgs = args.map(arg => {
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
  
  // html文字列をパースする
  // DOMParserだとscriptタグなどが削除されてしまい、処理に影響を及ぼすのでtemplateタグを使用
  const template = document.createElement('template');
  template.innerHTML = newString;
  const content = template.content;
  
  // contentのツリーを作成
  const elementVariables = generateTree(content);
  
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
    const isParentArray = Array.isArray(parentNode);
    const newNode = createNode(nodeName, nodeType, element);
    
    // もし配列なら値を追加、連想配列ならキーを追加
    if(isParentArray) {
      parentNode.push(newNode);
    } else {
      // nodeTypeが空（{}と[]のどちらでもない）なら値に要素を設定
      // そうでなければ配列や連想配列を設定する
      parentNode[nodeName] = nodeType ? newNode[nodeName] : element;
    }
    
    // nodeTypeが空でなければさらに探索
    if(nodeType) {
      const targetNode = isParentArray ?
        parentNode[parentNode.length - 1][nodeName] :
        parentNode[nodeName];
      buildTreeStructure(targetNode, element);
    }
  }
  
  // ノードを作成
  function createNode(nodeName, nodeType, element) {
    // nodeTypeが空なら要素を直に設定
    if(nodeType === undefined) {
      return { [nodeName]: element };
    }
    // そうでなければnodeTypeに基づいて型を設定
    return { [nodeName]: nodeType === '{}' ? {} : [] };
  }
  
  // *as属性の値を解析
  function parsePathAttribute(path) {
    return path.split(/(?=\[\]|\{\})/);
  }
  
  // ベースとなるツリーをもとにDOMを探索
  const tree = {};
  buildTreeStructure(tree, rootElement);
  return tree;
}

// 要素に設定できるすべてのイベント名を取得（webブラウザに依存）
class EventNameManager {
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
}

export { htmlv };