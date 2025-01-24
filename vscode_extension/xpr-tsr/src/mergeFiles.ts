import * as vscode from 'vscode';
import path from 'path';
import fs from 'fs';
import XprConverter from './XprConverter';

/** ルール定義ファイルと翻訳定義ファイルを格納するための型 */
type RulesTrans = { rules: string, trans: string };

/** .xprファイルと翻訳定義ファイルをそれぞれ統合するクラス */
export default class MergeFiles {
  
  /**
   * .xprファイルと翻訳定義ファイルをそれぞれ統合します。
   */
  public static execute(): void {
    /** アクティブなテキストエディタ */
    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) {
      /* コマンドを実行するにはテキストエディタをアクティブにしなければいけないため、
         通常はこの処理に入ることはない */
      vscode.window.showErrorMessage('アクティブなテキストエディタが見つかりません');
      return;
    }

    /** フォーカスされているファイル */
    const document = activeEditor.document;
    /** フォーカスされているファイル名 */
    const fileName = path.basename(document.uri.fsPath);
    if (fileName !== 'index.json') {
      vscode.window.showErrorMessage('`index.json`を開いた上で実行してください');
      return;
    }
    
    /** index.jsonが存在するディレクトリパス */
    const baseDirectoryPath = path.dirname(document.uri.fsPath);
    
    const rulesTrans = this.readFileInFolders(baseDirectoryPath);

    console.log(JSON.stringify(rulesTrans));
  }

  /**
   * 指定したディレクトリ直下のすべてのフォルダ名を取得します。
   * @param directoryPath 探索するディレクトリパス
   * @returns ディレクトリ直下のすべてのフォルダ名
   */
  private static getSubdirectories(directoryPath: string): Array<string> {
    /** ディレクトリ直下のすべてのファイルフォルダ名 */
    const items = fs.readdirSync(directoryPath);
    
    /** ディレクトリ直下のすべてのフォルダ名 */
    const folders = items.filter(item => {
      /** itemの絶対パス */
      const itemPath = path.join(directoryPath, item);
      /** itemがフォルダであるか */
      return fs.statSync(itemPath).isDirectory();
    });
    
    return folders;
  }
  
  /**
   * 指定したパスのファイルの内容を取得します。
   * 
   * **注: ファイルが存在するかを確認するためにこのメソッドを使用しないでください。**
   * @param filePath 内容を取得するファイルのパス
   * @returns ファイルの中身。ファイルが存在しない場合はnull
   */
  private static readFileContent(filePath: string): string | null {
    try {
      return fs.readFileSync(filePath, 'utf8');
    }
    // ファイルが存在しない場合
    catch (error) {
      return null;
    }
  }
  
  /**
   * ディレクトリ直下の各フォルダ内のルール定義ファイルと翻訳定義ファイルを取得します。
   * @param directoryPath 取得するフォルダのパス
   * @returns ルール定義ファイルと翻訳定義ファイルが格納された配列
   */
  private static readFileInFolders(directoryPath: string): Array<RulesTrans> {
    /** ディレクトリ直下のすべてのフォルダ名 */
    const folders = this.getSubdirectories(directoryPath);
    
    /** ルール定義ファイルと翻訳定義ファイルを格納するための配列 */
    const rulesTrans: RulesTrans[] = [];
    folders.forEach(folder => {
      /** フォルダの絶対パス */
      const folderPath = path.join(directoryPath, folder);
      
      /** ルール定義ファイルのパス */
      const rulesFilePath  = path.join(folderPath, 'rules.xpr');
      /** 翻訳定義ファイルのパス */
      const transFilePath = path.join(folderPath, 'trans.json');
      
      /** ルール定義ファイルの中身 */
      const rulesContent  = this.readFileContent(rulesFilePath);
      /** 翻訳定義ファイルの中身 */
      const transContent = this.readFileContent(transFilePath);
      
      
      
      // ルール定義ファイルと翻訳定義ファイルが存在しているか
      if (rulesContent !== null && transContent !== null) {
        // TODO:
        XprConverter.convert(rulesContent);
      
        // rulesTrans.push({ rules: rulesContent, trans: transContent });
      }
    });
    
    return rulesTrans;
  }
  
}
