class StyleManager {
  static addStyle(content) {
    const style = document.createElement('style');
    style.textContent = content;
    document.head.append(style);
  }
}

export default StyleManager;