import Console from './Console';
import { XprTokenizer, XprTokens } from './XprTokenizer';
import ERROR_MESSAGE from './XprErrorMessages';

/** .xprファイルをjsonに変換するクラス */
export default class XprConverter {
  /** 英数字とアンダースコアの組み合わせを抽出するための正規表現 */
  private static nameRegex = /^[A-Z0-9_]+$/;
  /** 識別子を抽出するための正規表現 */
  private static identifierRegex = /^\/.*$/;

  public static convert(input: string): void {
    const tokens = XprTokenizer.tokenize(input);
    this.buildTree(tokens);
  }

  private static buildTree(tokens: XprTokens): void {
    let name: string | null = null;
    let includes: string[] | null = null;
    let excludes: string[] | null = null;

    let token = tokens.nextToken();
    if (token === '@name') {
      if (name !== null) {
        Console.error(ERROR_MESSAGE.NAME_DUPLICATE);
        return;
      }

      name = this.parseName(tokens);
      if (name === null) return;
    }
    token = tokens.nextToken();
    if (token === '@includes') {
      if (includes !== null) {
        Console.error(ERROR_MESSAGE.INCLUDES_DUPLICATE);
        return;
      }

      includes = this.parseIncludes(tokens);
      if (includes === null) {
        return;
      }
    }

    console.log(name);
    console.log(includes);
  }

  private static parseName(tokens: XprTokens): string | null {
    let token = tokens.nextToken();
    if (token === null || token === ',') {
      Console.error(ERROR_MESSAGE.NAME_MISSING_IDENTIFIER);
      return null;
    }
    if (!this.nameRegex.test(token)) {
      Console.error(ERROR_MESSAGE.NAME_INVALID_FORMAT);
      return null;
    }

    const name = token;
    token = tokens.nextToken();
    if (token !== ',') {
      Console.error(ERROR_MESSAGE.NAME_MISSING_COMMA);
      return null;
    }

    return name;
  }

  private static parseIncludes(tokens: XprTokens): string[] | null {
    let token = tokens.nextToken();

    if (token !== '{') {
      Console.error(ERROR_MESSAGE.INCLUDES_BLOCK_NOT_STARTED);
      return null;
    }

    const directories: string[] = [];
    while (true) {
      token = tokens.nextToken();
      if (token === '}') {
        if (directories.length === 0) {
          Console.error(ERROR_MESSAGE.INCLUDES_EMPTY_DIRECTORIES);
          return null;
        }
        break;
      }

      if (token === null) {
        Console.error(ERROR_MESSAGE.INCLUDES_MISSING_DIRECTORY);
        return null;
      }
      if (!this.identifierRegex.test(token)) {
        Console.error(ERROR_MESSAGE.INCLUDES_INVALID_FORMAT);
        return null;
      }

      directories.push(token);
      token = tokens.nextToken();
      if (token !== ',') {
        Console.error(ERROR_MESSAGE.INCLUDES_MISSING_COMMA);
      }
    }

    return directories;
  }

  private static parseDirectories(tokens: XprTokens): string[] | null {
    const directories: string[] = [];

    while (true) {
      let token = tokens.nextToken();
      if (token === '}') break;

      const directory = this.parseDirectory(token);
      if (directory === null) return null;
      
      directories.push(directory);
      token = tokens.nextToken();
      if (token !== ',') {
        Console.error(ERROR_MESSAGE.INCLUDES_MISSING_COMMA);
      }
    }
    
    return directories;
  }

  private static parseDirectory(token: string | null): string | null {
    if (token === null) {
      Console.error(ERROR_MESSAGE.INCLUDES_MISSING_DIRECTORY);
      return null;
    }
    if (!this.identifierRegex.test(token)) {
      Console.error(ERROR_MESSAGE.INCLUDES_INVALID_FORMAT);
      return null;
    }
    return token;
  }
  
  private static validateComma(tokens: XprTokens): boolean {
    const token = tokens.nextToken();
    return token === ',';
  }
}
