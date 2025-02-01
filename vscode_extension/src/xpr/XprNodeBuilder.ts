import XprTokens from './XprTokens';
// eslint-disable-next-line @typescript-eslint/naming-convention
import ERROR_MESSAGE from './XprErrorMessages';
import REGEXP from './XprRegExp';
import Console from '../Console';
import { XprChildNode, XprNodes, XprParentNode, XprValueType } from './xpr';

/** トークンからノードデータのみのトークンツリーを作成するクラス */
export default class XprNodeBuilder {
  /** トークンの配列 */
  private tokens!: XprTokens;
  /** 現在のトークン */
  private token: string | null;

  /** シングルトンのインスタンス */
  private static readonly INSTANCE = new XprNodeBuilder();
  private constructor() {
    this.token = null;
  }

  /** インスタンスを取得します。 */
  public static getInstance(): XprNodeBuilder {
    return this.INSTANCE;
  }

  /**
   * ノードを解析します。
   * @param tokens トークンの配列
   * @returns ノードの配列、null: エラーが発生した場合
   */
  public buildTree(tokens: XprTokens): XprNodes | null {
    this.tokens = tokens;
    const nodes: XprNodes = [];

    while (true) {
      /** 一つの子ノード、もしくは親ノード */
      const node = this.recursive(false);
      if (node === null) return null;
      nodes.push(node);

      const token = this.peekToken();
      if (token === null) break;
    }
    return nodes;
  }

  /**
   * 再帰的にノードを解析します。
   * @param baseMulti マルチセレクタの初期値
   * @returns ノードの配列、null: エラーが発生した場合
   */
  private recursive(baseMulti: boolean): XprParentNode | XprChildNode | null {
    /** キーの一時保存用変数 */
    let key: string | null = null;
    /** XPathの一時保存用変数 */
    let xpath: string | null = null;
    /** マルチセレクタの一時保存用変数 */
    let multi: boolean = baseMulti;
    /** 属性名の一時保存用変数 */
    let attribute: string | null = null;
    /** ノードの一時保存用変数 */
    const nodes: Array<XprParentNode | XprChildNode> = [];

    while (true) {
      this.nextToken();
      // トークンがない場合、エラー
      if (this.token === null) {
        this.error(ERROR_MESSAGE.GENERAL.INVALID_TOKEN_END);
        return null;
      }

      /** トークンの種類 */
      const type = this.checkType();
      if (type === null) return null;

      switch (type) {
        // 通常ノード
        case XprValueType.KEY:
          key = this.token;
          break;
        case XprValueType.XPATH:
          xpath = this.token;
          break;
        case XprValueType.MULTI:
          multi = true;
          break;
        case XprValueType.ATTRIBUTE:
          // 属性は[]で囲まれているので、先頭と末尾の文字を削除
          attribute = this.token.slice(1, -1);
          break;
        // 特殊記号
        case XprValueType.BRACKET_OPEN:
          while (true) {
            // 入れ子を探索
            const node = this.recursive(multi);
            if (node === null) return null;
            nodes.push(node);

            // 次のトークンが`}`の場合、XprValueType.BRACKET_CLOSEに移動する
            const token = this.peekToken();
            if (token === '}') break;
          }
          break;
        case XprValueType.BRACKET_CLOSE:
          if (key === null || xpath === null) {
            this.error(ERROR_MESSAGE.NODE.MISSING_KEY_OR_XPATH);
            return null;
          }
          if (nodes.length === 0) {
            this.error(ERROR_MESSAGE.NODE.MISSING_NODE);
            return null;
          }

          return {
            key: key,
            xpath: xpath,
            nodes: nodes,
          } satisfies XprParentNode;
        case XprValueType.COMMA:
          if (xpath === null) {
            this.error(ERROR_MESSAGE.NODE.MISSING_XPATH);
            return null;
          }

          return {
            key: key,
            xpath: xpath,
            multi: multi,
            attribute: attribute,
          } satisfies XprChildNode;
      }
    }
  }

  /**
   * トークンの種類を取得します。
   * @returns トークンの種類、null: 無効なトークンの場合
   */
  private checkType(): XprValueType | null {
    if (this.validateRegex(REGEXP.KEY)) {
      return XprValueType.KEY;
    }
    if (this.validateRegex(REGEXP.XPATH)) {
      return XprValueType.XPATH;
    }
    if (this.validateRegex(REGEXP.MULTI)) {
      return XprValueType.MULTI;
    }
    if (this.validateRegex(REGEXP.ATTRIBUTE)) {
      return XprValueType.ATTRIBUTE;
    }
    if (this.validateToken('{')) {
      return XprValueType.BRACKET_OPEN;
    }
    if (this.validateToken('}')) {
      return XprValueType.BRACKET_CLOSE;
    }
    if (this.validateToken(',')) {
      return XprValueType.COMMA;
    }

    this.error(ERROR_MESSAGE.GENERAL.INVALID_TOKEN);
    return null;
  }

  /**
   * 現在のトークンが指定した文字であるかどうかを判定します。
   * @param expectedTokens 期待するトークン、複数ある場合はいずれかにマッチすればtrue
   * @returns true: マッチする場合、false: マッチしない場合
   */
  private validateToken(...expectedTokens: Array<string>): boolean {
    return this.token !== null && expectedTokens.includes(this.token);
  }

  /**
   * 現在のトークンが正規表現パターンにマッチしているかを判定します。
   * @param regex 正規表現パターン
   * @returns true: 正規表現パターンにマッチしている場合、false: マッチしていない場合
   */
  private validateRegex(regex: RegExp): boolean {
    return this.token !== null && regex.test(this.token);
  }

  // 次のトークンを取得します。ポインタが移動することはありません。
  private peekToken(): string | null {
    return this.tokens.peekToken();
  }

  /** 次のトークンをthis.tokenに格納します。 */
  private nextToken(): void {
    this.token = this.tokens.nextToken();
  }

  /** エラーメッセージを表示します。 */
  private error(message: string): void {
    Console.error(message + ' ' + this.tokens.get());
  }
}
