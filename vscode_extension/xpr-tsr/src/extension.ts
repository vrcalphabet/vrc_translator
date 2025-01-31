import * as vscode from 'vscode';
import MergeFiles from './mergeFiles';
import Console from './Console';

export function activate() {
  vscode.commands.registerCommand('extension.mergeXprAndTsrFiles', () => {
    try {
      MergeFiles.merge();
    } catch (e: any) {
      Console.error(e.stack);
    }
  });
}

export function deactivate() {}
