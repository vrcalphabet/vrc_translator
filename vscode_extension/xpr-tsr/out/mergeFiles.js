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
    editor;
    indexFilePath = '';
    index;
    directories;
    inputPath = '';
    outputPath = '';
    static INSTANCE = new MergeFiles();
    constructor() { }
    static getInstance() {
        return this.INSTANCE;
    }
    merge() {
        let success;
        success = this.setActiveEditor();
        if (!success)
            return;
        success = this.setIndex();
        if (!success)
            return;
        success = this.setPath();
        success = this.mergeRules();
        if (!success)
            return;
        success = this.mergeTrans();
        if (!success)
            return;
        Console_1.default.log('統合が完了しました');
    }
    setIndex() {
        this.indexFilePath = this.editor.document.uri.fsPath;
        const fileName = path_1.default.basename(this.indexFilePath);
        if (fileName !== 'index.json') {
            Console_1.default.error('`index.json`を開いた上で実行してください');
            return false;
        }
        const index = this.getIndex(this.indexFilePath);
        if (index === null)
            return false;
        this.index = index;
        return true;
    }
    setPath() {
        const basePath = path_1.default.dirname(this.indexFilePath);
        const directories = FileReader_1.default.getSubdirectories(basePath);
        this.directories = directories.filter((directory) => !this.index.ignore.includes(directory));
        this.inputPath = path_1.default.join(basePath, this.index.input);
        this.outputPath = path_1.default.join(basePath, this.index.output);
    }
    setActiveEditor() {
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor === undefined) {
            Console_1.default.error('アクティブなテキストエディタが見つかりません');
            return false;
        }
        this.editor = activeEditor;
        return true;
    }
    getIndex(path) {
        const index = FileReader_1.default.readFileContent(path);
        if (index === null)
            return null;
        const validatedIndex = IndexValidator_1.default.validate(index);
        if (validatedIndex === null)
            return null;
        return validatedIndex;
    }
    mergeRules() {
        const files = this.readRules();
        if (files === null)
            return false;
        const content = this.stringifyJSON(files);
        return this.writeFile('rules.json', content);
    }
    readRules() {
        const files = FileReader_1.default.readFileInFolders(this.inputPath, this.directories, 'rules.xpr', (content, folder) => {
            if (content === null) {
                Console_1.default.error(`フォルダ ${folder} に \`trans.json\` が存在しません`);
                return null;
            }
            return XprConverter_1.default.convert(content);
        });
        if (files === null)
            return null;
        return files;
    }
    writeFile(fileName, content) {
        const rulesPath = path_1.default.join(this.outputPath, fileName);
        const success = FileReader_1.default.writeFileContent(rulesPath, content);
        if (!success) {
            Console_1.default.error(`\`${fileName}\`に書き込めませんでした`);
        }
        return success;
    }
    mergeTrans() {
        const files = this.readTrans();
        if (files === null)
            return false;
        const content = this.stringifyJSON(files);
        return this.writeFile('trans.json', content);
    }
    readTrans() {
        const files = FileReader_1.default.readFileInFolders(this.inputPath, this.directories, 'trans.json', (content, folder) => {
            if (content === null) {
                Console_1.default.error(`フォルダ ${folder} に \`trans.json\` が存在しません`);
                return null;
            }
            try {
                return [folder, JSON.parse(content)];
            }
            catch (e) {
                Console_1.default.error(`フォルダ ${folder} の \`trans.json\` の構文が不正です。`);
                return null;
            }
        });
        if (files === null)
            return null;
        return Object.fromEntries(files);
    }
    stringifyJSON(json) {
        if (this.index.format) {
            return JSON.stringify(json, null, 2);
        }
        else {
            return JSON.stringify(json);
        }
    }
}
exports.default = MergeFiles;
//# sourceMappingURL=mergeFiles.js.map