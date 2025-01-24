/** xpr形式の文字列をトークンに分割するためのクラス */
export class XprTokenizer {
  /** コメントを抽出するための正規表現 */
  private static commentRegex = /%-.*?-%|%.*?(?=\n)/gs;
  
  /**
   * 入力された文字列をトークンに分割します。
   * @param input トークン化する入力文字列
   * @returns トークンの配列
   */
  public static tokenize(input: string): XprTokens {
    /** コメントを除去したinput */
    const strippedInput = input.replaceAll(this.commentRegex, '');
    /** 1行ごとまたはカンマ区切りで分割されたinput */
    const lines = strippedInput.split(/,|\n/);
    /** トークンの配列 */
    const tokens = new XprTokens();

    lines.forEach((line) => {
      // 空行の場合はスキップ
      if (line.trim().length === 0) {
        return;
      }

      /** 空白区切りのトークンに分割 */
      const splittedTokens = line.trim().split(/\s+/);
      tokens.add(...splittedTokens);

      // ネスト記号が含まれていない場合（ブロック内のノードの場合）
      if (!splittedTokens.includes('{') && !splittedTokens.includes('}')) {
        // 行の区切りを表す記号を追加
        tokens.add(',');
      }
    });

    // FIXME: デバッグ用
    console.log(tokens);
    return tokens;
  }
}

/** トークンを格納し、順次アクセスを可能にするクラス */
export class XprTokens {
  private tokens: Array<string>;
  private index;

  constructor() {
    this.tokens = [];
    this.index = 0;
  }

  /**
   * トークンを格納します。
   * @param token 格納するトークン
   */
  add(...token: string[]): void {
    this.tokens.push(...token);
  }

  /**
   * 次のトークンを取得します。
   * @returns 次のトークンで、無い場合はnull
   */
  nextToken(): string | null {
    // 配列の範囲外にポインタが当たっている場合
    if (this.index >= this.tokens.length) {
      return null;
    }
    return this.tokens[this.index++];
  }
}