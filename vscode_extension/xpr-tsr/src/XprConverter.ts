import XprBuilder from './XprBuilder';
import XprTokenizer from './XprTokenizer';

/** .xprファイルをjsonに変換するクラス */
export default class XprConverter {
  public static convert(input: string): void {
    const tokens = XprTokenizer.tokenize(input);
    XprBuilder.buildTree(tokens);
  }
}
