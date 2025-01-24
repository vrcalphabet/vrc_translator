import * as vscode from 'vscode';
import MergeFiles from './mergeFiles';
import Console from './Console';

export function activate() {
  vscode.commands.registerCommand('extension.mergeXprAndTsrFiles', () => {
    MergeFiles.execute();
  });
}

export function deactivate() {}
