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
    return arg;
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
  const template = document.createElement('template');
  template.innerHTML = newString;
  const content = template.content;
  
  // 要素変数を設定する
  const elementVariables = {};
  // *asがつく属性を取得
  content.querySelectorAll('[\\*as]').forEach(element => {
    const pathString = element.getAttribute('*as');
    // パスをもとにツリーを更新
    updateTree(elementVariables, pathString, element);
    element.removeAttribute('*as');
  });
  
  // イベントを設定
  const eventNames = getAllEventName();
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

// パス文字列からツリーを更新
function updateTree(root, pathString, value) {
  // ピリオド(.)と各括弧で分割したうえで、ピりオドは消去し、各括弧は残す
  const pathList = pathString.split(/\.|(?=\[\])/);
  
  // パスをもとにツリーを更新
  let current = root;
  pathList.forEach((path, index) => {
    const isLastPath = index === pathList.length - 1;
    const nextPath = pathList[index + 1];
    
    // 最後の要素ではないなら
    if(!isLastPath) {
      // プロパティが存在しない場合
      if(!(path in current)) {
        // もし次のパスが配列であるなら配列を作成、そうでなければオブジェクトを作成
        current[path] = (nextPath === '[]' ? [] : {});
      }
      
      // 参照を更新
      current = current[path];
    } else {
      // 最後のパスが配列であるなら要素を追加、そうでなければプロパティを設定
      if(path === '[]') {
        current.push(value);
      } else {
        current[path] = value;
      }
    }
  });
  
  return root;
}

const eventNameCache = [];
// 要素に設定できるすべてのイベント名を取得（webブラウザに依存）
function getAllEventName() {
  // 前回取得しているのなら前回の結果を返す
  if(eventNameCache.length > 0) {
    return eventNameCache;
  }
  
  const element = document.createElement('div');
  
  for(const key in element) {
    // プロパティ名の先頭にonがつくものはイベント名
    if(key.startsWith('on')) {
      // "on"を除いたイベント名を取得
      eventNameCache.push(key.slice(2));
    }
  }
  
  return eventNameCache;
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