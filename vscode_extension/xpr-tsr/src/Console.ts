import * as vscode from 'vscode';

/** vscodeの通知を表示するクラス */
export default class Console {
  /**
   * 情報をvscodeの通知として表示します。
   * @param message 表示したいメッセージ
   */
  public static log(...message: any[]): void {
    vscode.window.showInformationMessage(this.formatMessage(message));
  }

  /**
   * 注意をvscodeの通知として表示します。
   * @param message 表示したいメッセージ
   */
  public static warn(...message: any[]): void {
    vscode.window.showWarningMessage(this.formatMessage(message));
  }

  /**
   * 警告をvscodeの通知として表示します。
   * @param message 表示したいメッセージ
   */
  public static error(...message: any[]): void {
    vscode.window.showErrorMessage(this.formatMessage(message));
  }

  /**
   * any型配列のメッセージをstring型に変換し、半角スペースで結合します。
   * @param message 結合するメッセージ
   * @returns 半角スペース区切りで結合されたメッセージ
   */
  private static formatMessage(message: any[]): string {
    return message.map((msg) => msg.toString()).join(' ');
  }
}
