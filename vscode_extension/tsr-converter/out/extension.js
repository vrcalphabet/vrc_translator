const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const MergeJSON = require('./MergeJSON.class.js');

function activate() {
  vscode.commands.registerCommand('extension.mergeFiles', () => {
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
      
      const { output, base, files } = config;

      const outputPath = path.resolve(basePath, output);
      const baseFilePath = path.resolve(basePath, base);

      if(!fs.existsSync(baseFilePath)) {
        vscode.window.showErrorMessage('ベースファイルが見つかりません');
        return;
      }

      const baseFileContent = fs.readFileSync(baseFilePath, 'utf-8');
      const notExistFiles = [];
      const translations = {};

      for(const entry of files) {
        const filePath = path.resolve(basePath, entry);
        
        if(!fs.existsSync(filePath)) {
          notExistFiles.push(entry);
          continue;
        }
        
        const lang = path.basename(filePath, path.extname(filePath));
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        
        translations[lang] = JSON.parse(fileContent);
      }
      
      const result = MergeJSON.merge(JSON.parse(baseFileContent), translations);
      fs.writeFileSync(outputPath, JSON.stringify(result), 'utf-8');
      
      if(notExistFiles.length >= 1) {
        vscode.window.showWarningMessage('以下のファイルが見つかりませんでした: ' + notExistFiles.join());
      }
      
      vscode.window.showInformationMessage('変換が完了しました: ' + outputPath);
    } catch(e) {
      vscode.window.showErrorMessage('エラーが発生しました: ' + e.message);
      console.error(e);
    }
  });
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
}
