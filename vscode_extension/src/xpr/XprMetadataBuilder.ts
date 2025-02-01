import { XprErrorMessageBlock, XprMetadata } from './xpr';
import XprTokens from './XprTokens';
// eslint-disable-next-line @typescript-eslint/naming-convention
import ERROR_MESSAGE from './XprErrorMessages';
import REGEXP from './XprRegExp';
import Console from '../Console';

/** トークンからメタデータのみのトークンツリーを作成するクラス */
export default class XprMetadataBuilder {
  /** トークンの配列 */
  private tokens!: XprTokens;
  /** 現在のトークン */
  private token: string | null;

  /** シングルトンのインスタンス */
  private static readonly INSTANCE = new XprMetadataBuilder();
  private constructor() {
    this.token = null;
  }

  /** インスタンスを取得します。 */
  public static getInstance(): XprMetadataBuilder {
    return this.INSTANCE;
  }

  /**
   * メタデータを解析します。
   * @param tokens トークンの配列
   * @returns ノードの配列、null: エラーが発生した場合
   */
  public buildTree(tokens: XprTokens): XprMetadata | null {
    this.tokens = tokens;

    /** name識別子 */
    let name: string | null = null;
    /** includesディレクトリパスの配列 */
    let includes: Array<string> | null = null;
    /** excludesディレクトリパスの配列 */
    let excludes: Array<string> | null = null;

    while (true) {
      this.nextToken();
      // メタデータに何も記述されていない場合、エラー
      if (this.token === null) {
        this.error(ERROR_MESSAGE.GENERAL.MISSING_METADATA);
        return null;
      }

      switch (this.token) {
        // メタデータ
        case '@name':
          name = this.parseToken(name, this.parseName, ERROR_MESSAGE.NAME);
          if (name === null) return null;
          break;
        case '@includes':
          includes = this.parseToken(includes, this.parseIncludes, ERROR_MESSAGE.INCLUDES);
          if (includes === null) return null;
          break;
        case '@excludes':
          excludes = this.parseToken(excludes, this.parseExcludes, ERROR_MESSAGE.INCLUDES);
          if (excludes === null) return null;
          break;
        // メタデータの終わり
        default:
          // ノードトークンを読んでしまっているので、カーソルを前に戻す
          this.prevToken();

          // nameかincludesが無い場合はエラー
          if (name === null || includes === null) {
            this.error(ERROR_MESSAGE.GENERAL.MISSING_METADATA);
            return null;
          }
          // excludesは任意なので無い場合は空の配列にする
          if (excludes === null) {
            excludes = [];
          }

          return {
            name,
            includes,
            excludes,
          } satisfies XprMetadata;
      }
    }
  }

  /**
   * 各メタデータを解析します。
   *
   * currentではnullかどうかをチェックし、非nullの場合はメタデータの重複のためエラーを出します
   * @param current 各メタデータの現在の値
   * @param parseFunc 解析したいメタデータのメソッド
   * @param ERROR_BLOCK エラーメッセージのブロック
   * @returns メタデータの値、構文が間違っている場合はnull
   */
  private parseToken<T>(
    current: T | null,
    parseFunc: () => T | null,
    ERROR_BLOCK: XprErrorMessageBlock
  ): T | null {
    // 非nullの場合は値が既に設定されているということなので、エラー
    if (current !== null) {
      this.error(ERROR_BLOCK.DUPLICATE);
      return null;
    }
    // メタデータの値を取得し、返す
    return parseFunc.call(this);
  }

  /**
   * `@name`文を解析します。
   * @returns `identifier` name識別子
   */
  private parseName(): string | null {
    this.nextToken();
    // 次のトークンが無いか、カンマの場合はエラー
    if (this.token === null || this.validateToken(',')) {
      this.error(ERROR_MESSAGE.NAME.MISSING_IDENTIFIER);
      return null;
    }
    // 次のトークンが正規表現パターンにマッチしない場合はエラー
    if (!this.validateRegex(REGEXP.IDENTIFIER)) {
      this.error(ERROR_MESSAGE.NAME.INVALID_FORMAT);
      return null;
    }

    /** name識別子 */
    const name = this.token;
    this.nextToken();
    // 次のトークンがカンマでない場合はエラー
    if (!this.validateToken(',')) {
      this.error(ERROR_MESSAGE.NAME.MISSING_COMMA);
      return null;
    }

    return name;
  }

  /**
   * `@includes`文を解析します。
   * @returns `directory-path[]` includesディレクトリパスの配列
   */
  private parseIncludes(): Array<string> | null {
    /** ディレクトリパスの配列 */
    const directories = this.parseDirectories(true, ERROR_MESSAGE.INCLUDES);
    if (directories === null) return null;

    return directories;
  }

  /**
   * `@excludes`文を解析します。
   * @returns `directory-path[]` excludesディレクトリパスの配列
   */
  private parseExcludes(): Array<string> | null {
    /** ディレクトリパスの配列 */
    const directories = this.parseDirectories(false, ERROR_MESSAGE.EXCLUDES);
    if (directories === null) return null;

    return directories;
  }

  /**
   * ディレクトリパスの配列を取得します。
   * @param lengthCheck true: 長さ0の配列を許容しません、false: 長さ0の配列を許容します
   * @param ERROR_BLOCK エラーメッセージのブロック
   * @returns `directory-path[]` ディレクトリパスの配列
   */
  private parseDirectories(
    lengthCheck: boolean,
    ERROR_BLOCK: XprErrorMessageBlock
  ): Array<string> | null {
    this.nextToken();
    // 次のトークンがブロックの始まりでなければエラー
    if (!this.validateToken('{')) {
      this.error(ERROR_BLOCK.BLOCK_NOT_STARTED);
      return null;
    }

    const directories: Array<string> = [];
    while (true) {
      this.nextToken();
      // 次のトークンがブロックの終わりの場合は終了
      if (this.validateToken('}')) break;

      /** ディレクトリパス */
      const directory = this.parseDirectory(ERROR_BLOCK);
      if (directory === null) return null;
      directories.push(directory);
    }

    // 長さチェックが有効でかつ配列の長さが0の場合はエラー
    if (lengthCheck && directories.length === 0) {
      this.error(ERROR_BLOCK.EMPTY_DIRECTORIES);
      return null;
    }

    return directories;
  }

  /**
   * 次のディレクトリパスを取得します。
   * @param ERROR_BLOCK エラーメッセージのブロック
   * @returns 1つのディレクトリパス
   */
  private parseDirectory(ERROR_BLOCK: XprErrorMessageBlock): string | null {
    // 次のトークンがない場合はエラー
    if (this.token === null) {
      this.error(ERROR_BLOCK.MISSING_DIRECTORY);
      return null;
    }
    // 次のトークンが正規表現パターンにマッチしない場合はエラー
    if (!this.validateRegex(REGEXP.DIRECTORY_PATH)) {
      this.error(ERROR_BLOCK.INVALID_FORMAT);
      return null;
    }

    /** ディレクトリパス */
    const directory = this.token;
    this.nextToken();
    // 次のトークンがカンマでない場合はエラー
    if (!this.validateToken(',')) {
      this.error(ERROR_BLOCK.MISSING_COMMA);
      return null;
    }

    return directory;
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

  /** 前のトークンをthis.tokenに格納します。 */
  private prevToken(): void {
    this.token = this.tokens.prevToken();
  }

  /** エラーメッセージを表示します。 */
  private error(message: string): void {
    Console.error(message + ' ' + this.tokens.get());
  }
}
