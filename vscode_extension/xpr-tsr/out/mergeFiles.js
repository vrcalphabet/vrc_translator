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
const Console_1 = __importDefault(require("./Console"));
const IndexValidator_1 = __importDefault(require("./IndexValidator"));
const FileReader_1 = __importDefault(require("./FileReader"));
const XprConverter_1 = __importDefault(require("./xpr/XprConverter"));
class MergeFiles {
    static merge() {
        const activeEditor = this.getActiveEditor();
        if (activeEditor === null)
            return;
        const filePath = this.getCurrentFilePath(activeEditor);
        const fileName = path_1.default.basename(filePath);
        if (fileName !== 'index.json') {
            Console_1.default.error('`index.json`を開いた上で実行してください');
            return;
        }
        const index = this.getIndex(filePath);
        if (index === null)
            return;
        const { inputPath, outputPath } = this.getPath(filePath, index);
        this.setRules(inputPath, outputPath, index.ignore, index.format);
        Console_1.default.log('統合が完了しました');
    }
    static getPath(filePath, index) {
        const basePath = path_1.default.dirname(filePath);
        const inputPath = path_1.default.join(basePath, index.input);
        const outputPath = path_1.default.join(basePath, index.output);
        return { inputPath, outputPath };
    }
    static getActiveEditor() {
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor === undefined) {
            Console_1.default.error('アクティブなテキストエディタが見つかりません');
            return null;
        }
        return activeEditor;
    }
    static getCurrentFilePath(activeEditor) {
        const document = activeEditor.document;
        return document.uri.fsPath;
    }
    static getIndex(path) {
        const index = FileReader_1.default.readFileContent(path);
        if (index === null)
            return null;
        const validatedIndex = IndexValidator_1.default.validate(index);
        if (validatedIndex === null)
            return null;
        return validatedIndex;
    }
    static setRules(inputPath, outputPath, ignoreFolders, format) {
        const files = this.readRules(inputPath, ignoreFolders);
        if (files === null)
            return false;
        const content = this.stringifyJSON(files, format);
        return this.writeRulesFile(outputPath, content);
    }
    static readRules(inputPath, ignoreFolders) {
        const files = FileReader_1.default.readFileInFolders(inputPath, ignoreFolders, 'rules.xpr', (content) => {
            return XprConverter_1.default.convert(content);
        });
        if (files === null) {
            Console_1.default.error('`rules.xpr`が存在しないディレクトリがあります');
            return null;
        }
        return files;
    }
    static writeRulesFile(outputPath, content) {
        const rulesPath = path_1.default.join(outputPath, 'rules.json');
        const success = FileReader_1.default.writeFileContent(rulesPath, content);
        if (!success) {
            Console_1.default.error('`rules.json`に書き込めませんでした');
        }
        return success;
    }
    static stringifyJSON(json, format) {
        if (format) {
            return JSON.stringify(json, null, 2);
        }
        else {
            return JSON.stringify(json);
        }
    }
}
exports.default = MergeFiles;
//# sourceMappingURL=mergeFiles.js.map