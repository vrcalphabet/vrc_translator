import fs from 'fs';
import path from 'path';

export default class FileReader {
  /**
   * 指定したパスのファイルの内容を取得します。
   *
   * **注: ファイルが存在するかを確認するためにこのメソッドを使用しないでください。**
   * @param filePath 内容を取得するファイルのパス
   * @returns ファイルの中身。ファイルが存在しない場合はnull
   */
  public static readFileContent(filePath: string): string | null {
    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      // ファイルが存在しない場合
      return null;
    }
  }

  /**
   * 指定したファイルに内容を書き込みます。
   * @param filePath 書き込むファイルのパス
   * @param content 内容
   * @returns 正常に書き込めればtrue、書き込めなければfalse
   */
  public static writeFileContent(filePath: string, content: string): boolean {
    try {
      // ディレクトリが存在しない場合はディレクトリを作成
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 指定したディレクトリ直下のすべてのフォルダ名を取得します。
   * @param directoryPath 探索するディレクトリパス
   * @returns ディレクトリ直下のすべてのフォルダ名
   */
  public static getSubdirectories(directoryPath: string): Array<string> {
    /** ディレクトリ直下のすべてのファイルフォルダ名 */
    const items = fs.readdirSync(directoryPath);

    /** ディレクトリ直下のすべてのフォルダ名 */
    const folders = items.filter((item) => {
      /** itemの絶対パス */
      const itemPath = path.join(directoryPath, item);
      /** 無視フォルダではないかつitemがフォルダであるか */
      return fs.statSync(itemPath).isDirectory();
    });

    return folders;
  }

  /**
   * ディレクトリ直下のすべてのフォルダに存在する指定したファイルを読み込みます。
   * @param baseDirectoryPath 親ディレクトリのパス
   * @param directories フォルダ名の配列
   * @param fileName ファイル名
   * @param callbackFn ファイルの中身を処理する関数
   * @param callbackFn.content 読み込んだファイルの内容
   * @param callbackFn.directoryName フォルダ名
   * @returns ファイルの中身を処理した結果の配列、null: ファイルが存在しない場合
   */
  public static readFileInFolders(
    baseDirectoryPath: string,
    directories: Array<string>,
    fileName: string,
    callbackFn: (content: string | null, directoryName: string) => any | void
  ): Array<any> | null {
    /** 結果 */
    const results: Array<any> = [];

    for (const directory of directories) {
      /** フォルダのパス */
      const folderPath = path.join(baseDirectoryPath, directory);
      /** ファイルのパス */
      const filePath = path.join(folderPath, fileName);
      /** ファイルの中身 */
      const content = this.readFileContent(filePath);

      if (callbackFn !== undefined) {
        const cb = callbackFn(content, directory);
        if (cb === null) return null;
        results.push(cb);
      } else {
        results.push(content);
      }
    }

    return results;
  }
}
