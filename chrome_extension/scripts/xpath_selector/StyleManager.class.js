import { htmlv, sanitizeAttr, sanitizeText } from "./htmlv.js";

class StyleManager {
  static addStyle(content) {
    const { style } = htmlv`
      <style *as="style">${sanitizeText(content)}</style>
    `;
    document.head.append(style);
  }
  
  static loadStyle(url) {
    const { link } = htmlv`
      <link rel="stylesheet" href="${sanitizeAttr(url)}" *as="link">
    `;
    document.head.append(link);
  }
}

export default StyleManager;