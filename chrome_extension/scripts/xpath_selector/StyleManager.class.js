class StyleManager {
  static addStyle(content) {
    const style = document.createElement('style');
    style.textContent = content;
    document.head.append(style);
  }
  
  static loadStyle(url) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    console.log(link);
    document.head.append(link);
  }
}

export default StyleManager;