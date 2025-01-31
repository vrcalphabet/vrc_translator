"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class FileReader {
    static readFileContent(filePath) {
        try {
            return fs_1.default.readFileSync(filePath, 'utf8');
        }
        catch (error) {
            return null;
        }
    }
    static writeFileContent(filePath, content) {
        try {
            const dir = path_1.default.dirname(filePath);
            if (!fs_1.default.existsSync(dir)) {
                fs_1.default.mkdirSync(dir, { recursive: true });
            }
            fs_1.default.writeFileSync(filePath, content, 'utf8');
            return true;
        }
        catch (error) {
            return false;
        }
    }
    static getSubdirectories(directoryPath, ignoreFolders) {
        const items = fs_1.default.readdirSync(directoryPath);
        console.log(items, ignoreFolders);
        const folders = items.filter((item) => {
            const itemPath = path_1.default.join(directoryPath, item);
            return (!ignoreFolders.includes(item) &&
                fs_1.default.statSync(itemPath).isDirectory());
        });
        return folders;
    }
    static readFileInFolders(directoryPath, ignoreFolders, fileName, callbackFn) {
        const folders = this.getSubdirectories(directoryPath, ignoreFolders);
        const results = [];
        for (const folder of folders) {
            const folderPath = path_1.default.join(directoryPath, folder);
            const filePath = path_1.default.join(folderPath, fileName);
            const content = this.readFileContent(filePath);
            if (content === null) {
                return null;
            }
            else {
                results.push(callbackFn(content));
            }
        }
        return results;
    }
}
exports.default = FileReader;
//# sourceMappingURL=FileReader.js.map