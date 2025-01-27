import Console from './Console';
import XprTokens from './XprTokens';
import ERROR_MESSAGE from './XprErrorMessages';
import REGEXP from './XprRegExp';
import { XprErrorMessageBlock, XprMetadata } from './xpr';

export default class XprBuilder {
  private tokens!: XprTokens;

  private static readonly INSTANCE = new XprBuilder();
  private constructor() {}

  public static getInstance(): XprBuilder {
    return this.INSTANCE;
  }

  public buildTree(tokens: XprTokens): void {
    this.tokens = tokens;

    let metadataDefinitionComplete = false;
    let name: string | null = null;
    let includes: Array<string> | null = null;
    let excludes: Array<string> | null = null;

    let tempNode: XprTempNode;

    while (true) {
      let token = this.tokens.nextToken();
      if (token === null) return;

      if (metadataDefinitionComplete === false) {
        if (token === '@name') {
          name = this.parseToken(name, this.parseName, ERROR_MESSAGE.NAME);
          if (name === null) return;
        } else if (token === '@includes') {
          includes = this.parseToken(includes, this.parseIncludes, ERROR_MESSAGE.INCLUDES);
          if (includes === null) return;
        } else if (token === '@excludes') {
          excludes = this.parseToken(excludes, this.parseExcludes, ERROR_MESSAGE.INCLUDES);
          if (excludes === null) return;
        } else {
          if (name === null || includes === null) {
            Console.error(ERROR_MESSAGE.GENERAL.MISSING_METADATA);
            return;
          }
          tempNode = { key: null, xpath: null, multi: false, attribute: null };
          metadataDefinitionComplete = true;
        }
      } else if (token.startsWith('@')) {
        Console.error(ERROR_MESSAGE.GENERAL.AFTER_COMPLETE);
      } else {
        Console.log('終わり');
      }

      // console.log(name, includes, excludes);
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
    let token = this.tokens.nextToken();
    if (token === null || token === ',') {
      Console.error(ERROR_MESSAGE.NAME.MISSING_IDENTIFIER);
      return null;
    }
    if (!this.validateRegex(token, REGEXP.IDENTIFIER)) {
      Console.error(ERROR_MESSAGE.NAME.INVALID_FORMAT);
      return null;
    }

    const name = token;
    token = this.tokens.nextToken();
    if (token !== ',') {
      Console.error(ERROR_MESSAGE.NAME.MISSING_COMMA);
      return null;
    }

    return name;
  }

  private parseIncludes(): Array<string> | null {
    const directories = this.parseDirectories(true, ERROR_MESSAGE.INCLUDES);
    if (directories === null) return null;

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
    let token = this.tokens.nextToken();

    if (token !== '{') {
      Console.error(ERROR_BLOCK.BLOCK_NOT_STARTED);
      return null;
    }

    const directories: Array<string> = [];

    while (true) {
      let token = this.tokens.nextToken();
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

    token = this.tokens.nextToken();
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
}
