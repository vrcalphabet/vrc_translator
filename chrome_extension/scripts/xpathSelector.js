const cover = document.createElement('div');
cover.setAttribute('style', 'width: 100%; height: 100%; position: fixed; top: 0; left: 0; background-color: rgba(0 0 0 / 20%); z-index: 99999; display: none; pointer-events: none;');
document.body.append(cover);

const overlay = document.createElement('div');
overlay.setAttribute('style', 'position: fixed; z-index: 100000; border: 1px solid white; cursor: pointer;');

const colors = {
  blue: 'rgb(0 128 255 / 30%)',
  lime: 'rgb(64 255 0 / 30%)'
};

document.addEventListener('keydown', e => {
  if(e.key == 'Escape') {
    cover.style.display = 'none';
  }
  if(e.key != 'h' || !e.altKey) return;
  
  // 前回追加したオーバーレイを削除
  while(cover.firstChild) {
    cover.firstChild.remove();
  }
  
  cover.style.display = 'block';
  
  const { visibleTextNodes, titleOrPlaceholderNodes } = getAllTextNode(document.body);
  setOverlay(titleOrPlaceholderNodes, colors.lime);
  setOverlay(visibleTextNodes, colors.blue);
});

// 可視テキストノードを保持している要素を取得
function getAllTextNode(node) {
  const visibleTextNodes = [];
  const titleOrPlaceholderNodes = [];
  
  function traverse(node) {
    // テキストノード
    if(node instanceof Text) {
      const parent = node.parentElement;
      
      // テキストが空文字の場合はスキップ
      const content = node.textContent.trim();
      if(content.length === 0) return;
      
      // テキストが非表示の場合はスキップ
      const style = window.getComputedStyle(parent);
      if(
        style.display === 'none' ||
        style.visibility === 'hidden' ||
        style.opacity === '0'
      ) return;
      
      // テキストが小さくて見えない場合はスキップ
      const { width, height } = parent.getBoundingClientRect();
      if(width === 0 || height === 0) return;
      
      visibleTextNodes.push(parent);
    }
    
    // 要素ノード
    if(node instanceof Element) {
      // 要素にtitleまたはplaceholder属性がついていた場合
      const title = node.getAttribute('title');
      const placeholder = node.getAttribute('placeholder');
      if(
        (title !== null && title.trim().length > 0) ||
        (placeholder !== null && placeholder.trim().length > 0)
      ) {
        titleOrPlaceholderNodes.push(node);
      }
      
      // 特定のタグは除外
      if(
        ['SCRIPT', 'NOSCRIPT', 'TEXTAREA'].includes(node.tagName)
      ) return;
      
      // 子ノードを再帰的に探索
      for(const child of node.childNodes) {
        traverse(child);
      }
    }
  }
  
  traverse(node);
  return { visibleTextNodes, titleOrPlaceholderNodes };
}

function setOverlay(nodes, backgroundColor) {
  const clonedNodes = [];
  
  for(const node of nodes) {
    const { x, y, width, height } = node.getBoundingClientRect();
    
    const overlayClone = overlay.cloneNode(Infinity);
    overlayClone.style.left = x + 'px';
    overlayClone.style.top = y + 'px';
    overlayClone.style.width = width + 'px';
    overlayClone.style.height = height + 'px';
    overlayClone.style.backgroundColor = backgroundColor;
    
    cover.append(overlayClone);
    clonedNodes.push(overlayClone);
  }
  
  return clonedNodes;
}

// document.addEventListener('click', e => {
//   if(!running) return;
//   e.stopPropagation();
//   e.preventDefault();
  
//   const x = e.clientX;
//   const y = e.clientY;
  
//   const element = document.elementFromPoint(x, y);
//   const { top, left, width, height } = element.getBoundingClientRect();
  
//   overlay.style.display = null;
  
//   overlay.style.top = top + 'px';
//   overlay.style.left = left + 'px';
//   overlay.style.width = width + 'px';
//   overlay.style.height = height + 'px';
// }, true);