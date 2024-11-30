const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const XPRParser = require('./XPRParser.class.js');

function activate() {
  vscode.commands.registerCommand('extension.convertFiles', () => {
    try {
      const editor = vscode.window.activeTextEditor;
      if(!editor) return;
      
      const document = editor.document;
      const basePath = path.dirname(document.uri.fsPath);
      const content = document.getText();
      
      let config;
      try {
        config = JSON.parse(content);
      } catch(e) {
        vscode.window.showErrorMessage('JSONを変換できませんでした');
        return;
      }
      
      const { output, files } = config;
      
      const outputPath = path.resolve(basePath, output);
      
      const notExistFiles = [];
      const result = {};
      
      for(const entry of files) {
        const filePath = path.resolve(basePath, entry);
        
        if(!fs.existsSync(filePath)) {
          notExistFiles.push(entry);
          continue;
        }
        
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const tree = XPRParser.parse(fileContent);
        
        Object.assign(result, tree);
      }
      
      fs.writeFileSync(outputPath, JSON.stringify(result), 'utf-8');
      
      if(notExistFiles.length >= 1) {
        vscode.window.showWarningMessage('以下のファイルが見つかりませんでした: ' + notExistFiles.join());
      }
      
      vscode.window.showInformationMessage('変換が完了しました: ' + outputPath);
    } catch(e) {
      vscode.window.showErrorMessage('エラーが発生しました: ' + e.message);
    }
  });
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};