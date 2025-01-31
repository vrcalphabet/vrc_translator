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
  /** アクティブなテキストエディタ */
  private editor!: vscode.TextEditor;
  /** `index.json`のパス */
  private indexFilePath: string = '';
  /** `index.json`の内容 */
  private index!: IndexDefinition;
  /** 入力フォルダ名の配列 */
  private directories!: Array<string>;
  /** 入力フォルダのパス */
  private inputPath: string = '';
  /** 出力フォルダのパス */
  private outputPath: string = '';

  /** シングルトンのインスタンス */
  private static readonly INSTANCE = new MergeFiles();
  private constructor() {}

  /** インスタンスを取得します */
  public static getInstance(): MergeFiles {
    return this.INSTANCE;
  }

  /**
   * .xprファイルと翻訳定義ファイルをそれぞれ統合します。
   */
  public merge(): void {
    // TODO: エラーハンドリング
    this.setActiveEditor();
    this.setIndex();
    this.setPath();
    this.mergeRules();
    this.mergeTrans();
    Console.log('統合が完了しました');
  }

  /**
   * `index.json`の内容を設定します。
   */
  private setIndex(): void {
    this.indexFilePath = this.editor.document.uri.fsPath;
    /** ファイル名 */
    const fileName = path.basename(this.indexFilePath);
    if (fileName !== 'index.json') {
      Console.error('`index.json`を開いた上で実行してください');
      return;
    }

    /** index.jsonファイルの中身 */
    const index = this.getIndex(this.indexFilePath);
    if (index === null) return;

    this.index = index;
  }

  /**
   * `index.json`の内容から入力ファイルと出力ファイルのパスを設定します。
   */
  private setPath(): void {
    /** index.jsonが存在するフォルダパス */
    const basePath = path.dirname(this.indexFilePath);
    const directories = FileReader.getSubdirectories(basePath);
    // ignoreに含まれているフォルダを除外
    this.directories = directories.filter(directory => !this.index.ignore.includes(directory));
    this.inputPath = path.join(basePath, this.index.input);
    this.outputPath = path.join(basePath, this.index.output);
  }

  /**
   * アクティブなエディターを設定します。
   */
  private setActiveEditor(): void {
    /** アクティブなテキストエディタ */
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor === undefined) {
      /* コマンドを実行するにはテキストエディタをアクティブにしなければいけないため、
         通常はこの処理に入ることはない */
      Console.error('アクティブなテキストエディタが見つかりません');
      return;
    }

    this.editor = activeEditor;
  }

  /**
   * `index.json`の内容をバリデートした上で取得します。
   * @param path `index.json`のパス
   * @returns バリデートした`index.json`の内容。バリデートに失敗した場合はnull
   */
  private getIndex(path: string): IndexDefinition | null {
    // index.jsonの中身を取得
    const index = FileReader.readFileContent(path);
    if (index === null) return null;

    // スキーマを検証
    const validatedIndex = IndexValidator.validate(index);
    if (validatedIndex === null) return null;

    return validatedIndex;
  }

  /**
   * basePath直下のディレクトリの全てのrules.xprを統合し、rules.jsonを作成します。
   * @returns 正常に書き込めたか
   */
  private mergeRules(): boolean {
    /** 各rules.xprファイルの配列 */
    const files = this.readRules();
    if (files === null) return false;

    /** フォーマットされたjson */
    const content = this.stringifyJSON(files);
    return this.writeRulesFile(content);
  }

  /**
   * 指定したフォルダ内の全てのrules.xprファイルを読み込みます。
   * @returns rules.xprファイルの配列、エラーの場合はnull
   */
  private readRules(): Array<XprFile> | null {
    /** 各rules.xprファイルの配列 */
    const files = FileReader.readFileInFolders(
      this.inputPath,
      this.directories,
      'rules.xpr',
      (content, folder) => {
        if (content === null) {
          Console.error(`フォルダ ${folder} に \`trans.json\` が存在しません`);
          return null;
        }
        return XprConverter.convert(content);
      }
    ) as Array<XprFile> | null;

    if (files === null) return null;
    return files;
  }

  /**
   * rules.jsonを出力します。
   * @param content rules.jsonの内容
   * @returns 正常に書き込めたか
   */
  private writeRulesFile(content: string): boolean {
    const rulesPath = path.join(this.outputPath, 'rules.json');
    const success = FileReader.writeFileContent(rulesPath, content);
    if (!success) {
      Console.error('`rules.json`に書き込めませんでした');
    }
    return success;
  }

  /**
   * basePath直下のディレクトリの全てのtrans.jsonを統合し、新たなtrans.jsonを作成します。
   * @returns 正常に書き込めたか
   */
  private mergeTrans(): boolean {
    const files = this.readTrans();
    if (files === null) return false;

    const content = this.stringifyJSON(files);
    return this.writeTransFile(content);
  }

  /**
   * 指定したフォルダ内の全てのtrans.jsonファイルを読み込みます。
   * @returns trans.jsonファイルの配列、エラーの場合はnull
   */
  private readTrans(): any {
    const files = FileReader.readFileInFolders(
      this.inputPath,
      this.directories,
      'trans.json',
      (content, folder) => {
        if (content === null) {
          Console.error(`フォルダ ${folder} に \`trans.json\` が存在しません`);
          return null;
        }
        return JSON.parse(content);
      }
    );

    if (files === null) return null;
    return files;
  }

  /**
   * trans.jsonを出力します。
   * @param content trans.jsonの内容
   * @returns 正常に書き込めたか
   */
  private writeTransFile(content: string): boolean {
    const transPath = path.join(this.outputPath, 'trans.json');
    const success = FileReader.writeFileContent(transPath, content);
    if (!success) {
      Console.error('`trans.json`に書き込めませんでした');
    }
    return success;
  }

  /**
   * オブジェクトをJSON文字列に変換します。
   * @param json 変換対象のデータ
   * @returns JSON文字列
   */
  private stringifyJSON(json: any): string {
    if (this.index.format) {
      return JSON.stringify(json, null, 2);
    } else {
      return JSON.stringify(json);
    }
  }
}
