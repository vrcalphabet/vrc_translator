"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = __importStar(require("vscode"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const XprConverter_1 = __importDefault(require("./XprConverter"));
class MergeFiles {
    static execute() {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            vscode.window.showErrorMessage('アクティブなテキストエディタが見つかりません');
            return;
        }
        const document = activeEditor.document;
        const fileName = path_1.default.basename(document.uri.fsPath);
        if (fileName !== 'index.json') {
            vscode.window.showErrorMessage('`index.json`を開いた上で実行してください');
            return;
        }
        const baseDirectoryPath = path_1.default.dirname(document.uri.fsPath);
        const rulesTrans = this.readFileInFolders(baseDirectoryPath);
        console.log(JSON.stringify(rulesTrans));
    }
    static getSubdirectories(directoryPath) {
        const items = fs_1.default.readdirSync(directoryPath);
        const folders = items.filter((item) => {
            const itemPath = path_1.default.join(directoryPath, item);
            return fs_1.default.statSync(itemPath).isDirectory();
        });
        return folders;
    }
    static readFileContent(filePath) {
        try {
            return fs_1.default.readFileSync(filePath, 'utf8');
        }
        catch (error) {
            return null;
        }
    }
    static readFileInFolders(directoryPath) {
        const folders = this.getSubdirectories(directoryPath);
        const rulesTrans = [];
        folders.forEach((folder) => {
            const folderPath = path_1.default.join(directoryPath, folder);
            const rulesFilePath = path_1.default.join(folderPath, 'rules.xpr');
            const transFilePath = path_1.default.join(folderPath, 'trans.json');
            const rulesContent = this.readFileContent(rulesFilePath);
            const transContent = this.readFileContent(transFilePath);
            if (rulesContent !== null && transContent !== null) {
                XprConverter_1.default.convert(rulesContent);
            }
        });
        return rulesTrans;
    }
}
exports.default = MergeFiles;
//# sourceMappingURL=mergeFiles.js.map