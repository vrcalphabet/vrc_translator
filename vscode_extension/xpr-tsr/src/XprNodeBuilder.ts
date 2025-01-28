import XprTokens from './XprTokens';
import ERROR_MESSAGE from './XprErrorMessages';
import REGEXP from './XprRegExp';
import Console from './Console';
import { XprValueType } from './xpr';

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

  /** ノードを解析します。 */
  public buildTree(tokens: XprTokens): void | null {
    this.tokens = tokens;

    let key: string | null = null;
    let xpath: string | null = null;
    let multi: boolean = false;

    while (true) {
      this.nextToken();
      // トークンがない場合、エラー
      if (this.token === null) {
        Console.error(ERROR_MESSAGE.GENERAL.INVALID_TOKEN_END);
        return null;
      }

      const type = this.checkType();
      if (type === null) return null;

      switch (type) {
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
          break;
        case XprValueType.BRACKET_OPEN:
          console.log({ key, xpath, multi });
          return null;
        case XprValueType.BRACKET_CLOSE:
          break;
        case XprValueType.COMMA:
          break;
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

    Console.error(ERROR_MESSAGE.GENERAL.INVALID_TOKEN);
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

  /** 次のトークンをthis.tokenに格納します。 */
  private nextToken(): void {
    this.token = this.tokens.nextToken();
  }
}
