import * as vscode from 'vscode';
import path from 'path';
import Console from './Console';
import { IndexDefinition } from '.';
import IndexValidator from './IndexValidator';
import FileReader from './FileReader';
import XprConverter from './xpr/XprConverter';
import { XprFile } from './xpr/xpr';

/** .xprファイルと翻訳定義ファイルをそれぞれ統合するクラス */
export default class MergeFiles {
  /**
   * .xprファイルと翻訳定義ファイルをそれぞれ統合します。
   */
  public static merge(): void {
    /** アクティブなテキストエディタ */
    const activeEditor = this.getActiveEditor();
    if (activeEditor === null) return;

    /** index.jsonのパス */
    const filePath = this.getCurrentFilePath(activeEditor);
    /** ファイル名 */
    const fileName = path.basename(filePath);
    if (fileName !== 'index.json') {
      Console.error('`index.json`を開いた上で実行してください');
      return;
    }

    /** index.jsonファイルの中身 */
    const index = this.getIndex(filePath);
    if (index === null) return;

    const { inputPath, outputPath } = this.getPath(filePath, index);
    this.setRules(inputPath, outputPath, index.ignore, index.format);
    Console.log('統合が完了しました');
  }

  /**
   * `index.json`の内容から入力ファイルと出力ファイルのパスを取得します。
   * @param filePath `index.json`のパス
   * @param index `index.json`の内容
   * @returns 入力ファイルと出力ファイルのパス
   */
  private static getPath(
    filePath: string,
    index: IndexDefinition
  ): { inputPath: string; outputPath: string } {
    /** index.jsonが存在するフォルダパス */
    const basePath = path.dirname(filePath);
    const inputPath = path.join(basePath, index.input);
    const outputPath = path.join(basePath, index.output);
    return { inputPath, outputPath };
  }

  /**
   * アクティブなエディターを取得します。
   * @returns アクティブなエディター。エディターが存在しない場合はnull
   */
  private static getActiveEditor(): vscode.TextEditor | null {
    /** アクティブなテキストエディタ */
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor === undefined) {
      /* コマンドを実行するにはテキストエディタをアクティブにしなければいけないため、
         通常はこの処理に入ることはない */
      Console.error('アクティブなテキストエディタが見つかりません');
      return null;
    }
    return activeEditor;
  }

  /**
   * 現在フォーカスされているファイルのパスを取得します。
   * @param activeEditor アクティブなエディター
   * @returns 現在フォーカスされているファイルのパス
   */
  private static getCurrentFilePath(activeEditor: vscode.TextEditor): string {
    /** フォーカスされているファイル */
    const document = activeEditor.document;
    /** ファイルパス */
    return document.uri.fsPath;
  }

  /**
   * `index.json`の内容をバリデートした上で取得します。
   * @param path `index.json`のパス
   * @returns バリデートした`index.json`の内容。バリデートに失敗した場合はnull
   */
  private static getIndex(path: string): IndexDefinition | null {
    const index = FileReader.readFileContent(path);
    if (index === null) return null;

    const validatedIndex = IndexValidator.validate(index);
    if (validatedIndex === null) return null;

    return validatedIndex;
  }

  /**
   * basePath直下のディレクトリの全てのrules.xprを統合し、rules.jsonを作成します。
   * @param inputPath 探索対象の親ディレクトリのパス
   * @param outputPath 出力先のディレクトリのパス
   * @param format インデントをするかどうか、true: インデントする、false: インデントしない
   * @returns 正常に書き込めたか
   */
  private static setRules(
    inputPath: string,
    outputPath: string,
    ignoreFolders: Array<string>,
    format: boolean
  ): boolean {
    /** 各rules.xprファイルの配列 */
    const files = this.readRules(inputPath, ignoreFolders);
    if (files === null) return false;

    /** フォーマットされたjson */
    const content = this.stringifyJSON(files, format);
    return this.writeRulesFile(outputPath, content);
  }
  
  /**
   * 指定したフォルダ内の全てのrules.xprファイルを読み込みます。
   * @param inputPath 親ディレクトリのパス
   * @param ignoreFolders 無視するフォルダ名の配列
   * @returns rules.xprファイルの配列、エラーの場合はnull
   */
  private static readRules(inputPath: string, ignoreFolders: Array<string>): Array<XprFile> | null {
    /** 各rules.xprファイルの配列 */
    const files = FileReader.readFileInFolders(inputPath, ignoreFolders, 'rules.xpr', (content) => {
      return XprConverter.convert(content);
    }) as Array<XprFile> | null;

    if (files === null) {
      Console.error('`rules.xpr`が存在しないディレクトリがあります');
      return null;
    }
    return files;
  }
  
  /**
   * rules.jsonを出力します。
   * @param outputPath 出力先のディレクトリのパス
   * @param content rules.jsonの内容
   * @returns 正常に書き込めたか
   */
  private static writeRulesFile(outputPath: string, content: string): boolean {
    const rulesPath = path.join(outputPath, 'rules.json');
    const success = FileReader.writeFileContent(rulesPath, content);
    if (!success) {
      Console.error('`rules.json`に書き込めませんでした');
    }
    return success;
  }

  /**
   * オブジェクトをJSON文字列に変換します。
   * @param json 変換対象のデータ
   * @param format インデントをするかどうか、true: インデントする、false: インデントしない
   * @returns JSON文字列
   */
  private static stringifyJSON(json: any, format: boolean): string {
    if (format) {
      return JSON.stringify(json, null, 2);
    } else {
      return JSON.stringify(json);
    }
  }
}
