import * as vscode from 'vscode';
import MergeFiles from './MergeFiles';
import Console from './Console';

export function activate() {
  vscode.commands.registerCommand('extension.mergeXprAndTsrFiles', () => {
    try {
      const merger = MergeFiles.getInstance();
      merger.merge();
    } catch (e: any) {
      Console.error(e.stack);
    }
  });
}

export function deactivate() {}
