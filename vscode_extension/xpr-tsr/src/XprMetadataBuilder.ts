import Console from './Console';
import { XprErrorMessageBlock, XprMetadata } from './xpr';
import XprTokens from './XprTokens';
import ERROR_MESSAGE from './XprErrorMessages';
import REGEXP from './XprRegExp';

export default class XprMetadataBuilder {
  private tokens!: XprTokens;

  private static readonly INSTANCE = new XprMetadataBuilder();
  private constructor() {}

  public static getInstance(): XprMetadataBuilder {
    return this.INSTANCE;
  }

  public buildTree(tokens: XprTokens): XprMetadata | null {
    this.tokens = tokens;

    let name: string | null = null;
    let includes: Array<string> | null = null;
    let excludes: Array<string> | null = null;

    while (true) {
      let token = this.nextToken();
      if (token === null) return null;

      switch (token) {
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
        default:
          console.log(token);
          if (name === null || includes === null) {
            Console.error(ERROR_MESSAGE.GENERAL.MISSING_METADATA);
            return null;
          }

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

  private parseToken<T>(
    current: T | null,
    parseFunc: () => T | null,
    ERROR_BLOCK: XprErrorMessageBlock
  ): T | null {
    if (current !== null) {
      Console.error(ERROR_BLOCK.DUPLICATE);
      return null;
    }
    return parseFunc();
  }

  private parseName(): string | null {
    let token = this.nextToken();
    if (token === null || token === ',') {
      Console.error(ERROR_MESSAGE.NAME.MISSING_IDENTIFIER);
      return null;
    }
    if (!this.validateRegex(token, REGEXP.IDENTIFIER)) {
      Console.error(ERROR_MESSAGE.NAME.INVALID_FORMAT);
      return null;
    }

    const name = token;
    token = this.nextToken();
    if (token !== ',') {
      Console.error(ERROR_MESSAGE.NAME.MISSING_COMMA);
      return null;
    }

    return name;
  }

  private parseIncludes(): Array<string> | null {
    const directories = this.parseDirectories(true, ERROR_MESSAGE.INCLUDES);
    if (directories === null) return null;
    if(0) {0}
    
    return directories;
  }

  private parseExcludes(): Array<string> | null {
    const directories = this.parseDirectories(false, ERROR_MESSAGE.EXCLUDES);
    if (directories === null) return null; 

    return directories;
  }

  private parseDirectories(
    lengthCheck: boolean,
    ERROR_BLOCK: XprErrorMessageBlock
  ): Array<string> | null {
    let token = this.nextToken();
    if (token !== '{') {
      Console.error(ERROR_BLOCK.BLOCK_NOT_STARTED);
      return null;
    }

    const directories: Array<string> = [];
    while (true) {
      let token = this.nextToken();
      if (token === '}') break;

      const directory = this.parseDirectory(token, ERROR_BLOCK);
      if (directory === null) return null;
      directories.push(directory);
    }

    if (lengthCheck && directories.length === 0) {
      Console.error(ERROR_BLOCK.EMPTY_DIRECTORIES);
      return null;
    }

    return directories;
  }

  private parseDirectory(token: string | null, ERROR_BLOCK: XprErrorMessageBlock): string | null {
    if (token === null) {
      Console.error(ERROR_BLOCK.MISSING_DIRECTORY);
      return null;
    }
    if (!this.validateRegex(token, REGEXP.DIRECTORY_PATH)) {
      Console.error(ERROR_BLOCK.INVALID_FORMAT);
      return null;
    }

    const directory = token;

    token = this.nextToken();
    if (!this.validateComma(token)) {
      Console.error(ERROR_BLOCK.MISSING_COMMA);
      return null;
    }

    return directory;
  }

  /**
   * トークンがカンマかどうかを判定します。
   * @param token トークン
   * @returns true: カンマである場合、false: カンマ以外の場合
   */
  private validateComma(token: string | null): boolean {
    return token === ',';
  }

  /**
   * トークンが正規表現パターンにマッチしているかを判定します。
   * @param token トークン
   * @param regex 正規表現パターン
   * @returns true: 正規表現パターンにマッチしている場合、false: マッチしていない場合
   */
  private validateRegex(token: string | null, regex: RegExp): boolean {
    return token !== null && regex.test(token);
  }

  /**
   * this.tokens.nextTokenを呼び出します。
   * @returns 次のトークン
   */
  private nextToken(): string | null {
    return this.tokens.nextToken();
  }
}
