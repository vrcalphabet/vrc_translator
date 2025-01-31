/** トークンを格納し、順次アクセスを可能にするクラス */
export default class XprTokens {
  private tokens: Array<string>;
  private index;

  public constructor() {
    this.tokens = [];
    this.index = -1;
  }

  /**
   * トークンを格納します。
   * @param token 格納するトークン
   */
  public add(...token: string[]): void {
    this.tokens.push(...token);
  }

  /**
   * ポインタを移動せずに次のトークンを取得します。
   * @returns 次のトークンで、無い場合はnull
   */
  public peekToken(): string | null {
    // 配列の範囲外にポインタが当たっている場合
    if (this.index <= 0 || this.index >= this.tokens.length - 1) {
      return null;
    }
    return this.tokens[this.index + 1];
  }

  /**
   * 次のトークンを取得します。
   * @returns 次のトークンで、無い場合はnull
   */
  public nextToken(): string | null {
    // 配列の範囲外にポインタが当たっている場合
    if (this.index >= this.tokens.length - 1) {
      return null;
    }
    return this.tokens[++this.index];
  }

  /**
   * 前のトークンを取得します。
   * @return 前のトークンで、無い場合はnull
   */
  public prevToken(): string | null {
    // 配列の範囲外にポインタが当たっている場合
    if (this.index <= 0) {
      return null;
    }
    return this.tokens[--this.index];
  }

  /**
   * 現在のポインタのトークンの前後を取得します。
   * @param offset 前後のトークン数で、デフォルトは5
   * @returns 半角スペース区切りのトークン
   */
  public get(offset: number = 5): string {
    const index = Math.max(0, Math.min(this.index, this.tokens.length - 1));
    const tokens = this.tokens.map((token, i) => (i === index ? `>>>${token}<<<` : token));

    const left = Math.max(0, this.index - offset);
    const right = Math.min(this.tokens.length, this.index + offset);
    return tokens.slice(left, right).join(' ');
  }
}
