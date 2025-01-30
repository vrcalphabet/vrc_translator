"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const XprErrorMessages_1 = __importDefault(require("./XprErrorMessages"));
const XprRegExp_1 = __importDefault(require("./XprRegExp"));
const Console_1 = __importDefault(require("./Console"));
class XprMetadataBuilder {
    tokens;
    token;
    static INSTANCE = new XprMetadataBuilder();
    constructor() {
        this.token = null;
    }
    static getInstance() {
        return this.INSTANCE;
    }
    buildTree(tokens) {
        this.tokens = tokens;
        let name = null;
        let includes = null;
        let excludes = null;
        while (true) {
            this.nextToken();
            if (this.token === null) {
                this.error(XprErrorMessages_1.default.GENERAL.MISSING_METADATA);
                return null;
            }
            switch (this.token) {
                case '@name':
                    name = this.parseToken(name, this.parseName, XprErrorMessages_1.default.NAME);
                    if (name === null)
                        return null;
                    break;
                case '@includes':
                    includes = this.parseToken(includes, this.parseIncludes, XprErrorMessages_1.default.INCLUDES);
                    if (includes === null)
                        return null;
                    break;
                case '@excludes':
                    excludes = this.parseToken(excludes, this.parseExcludes, XprErrorMessages_1.default.INCLUDES);
                    if (excludes === null)
                        return null;
                    break;
                default:
                    this.prevToken();
                    if (name === null || includes === null) {
                        this.error(XprErrorMessages_1.default.GENERAL.MISSING_METADATA);
                        return null;
                    }
                    if (excludes === null) {
                        excludes = [];
                    }
                    return {
                        name,
                        includes,
                        excludes,
                    };
            }
        }
    }
    parseToken(current, parseFunc, ERROR_BLOCK) {
        if (current !== null) {
            this.error(ERROR_BLOCK.DUPLICATE);
            return null;
        }
        return parseFunc.call(this);
    }
    parseName() {
        this.nextToken();
        if (this.token === null || this.validateToken(',')) {
            this.error(XprErrorMessages_1.default.NAME.MISSING_IDENTIFIER);
            return null;
        }
        if (!this.validateRegex(XprRegExp_1.default.IDENTIFIER)) {
            this.error(XprErrorMessages_1.default.NAME.INVALID_FORMAT);
            return null;
        }
        const name = this.token;
        this.nextToken();
        if (!this.validateToken(',')) {
            this.error(XprErrorMessages_1.default.NAME.MISSING_COMMA);
            return null;
        }
        return name;
    }
    parseIncludes() {
        const directories = this.parseDirectories(true, XprErrorMessages_1.default.INCLUDES);
        if (directories === null)
            return null;
        return directories;
    }
    parseExcludes() {
        const directories = this.parseDirectories(false, XprErrorMessages_1.default.EXCLUDES);
        if (directories === null)
            return null;
        return directories;
    }
    parseDirectories(lengthCheck, ERROR_BLOCK) {
        this.nextToken();
        if (!this.validateToken('{')) {
            this.error(ERROR_BLOCK.BLOCK_NOT_STARTED);
            return null;
        }
        const directories = [];
        while (true) {
            this.nextToken();
            if (this.validateToken('}'))
                break;
            const directory = this.parseDirectory(ERROR_BLOCK);
            if (directory === null)
                return null;
            directories.push(directory);
        }
        if (lengthCheck && directories.length === 0) {
            this.error(ERROR_BLOCK.EMPTY_DIRECTORIES);
            return null;
        }
        return directories;
    }
    parseDirectory(ERROR_BLOCK) {
        if (this.token === null) {
            this.error(ERROR_BLOCK.MISSING_DIRECTORY);
            return null;
        }
        if (!this.validateRegex(XprRegExp_1.default.DIRECTORY_PATH)) {
            this.error(ERROR_BLOCK.INVALID_FORMAT);
            return null;
        }
        const directory = this.token;
        this.nextToken();
        if (!this.validateToken(',')) {
            this.error(ERROR_BLOCK.MISSING_COMMA);
            return null;
        }
        return directory;
    }
    validateToken(...expectedTokens) {
        return this.token !== null && expectedTokens.includes(this.token);
    }
    validateRegex(regex) {
        return this.token !== null && regex.test(this.token);
    }
    nextToken() {
        this.token = this.tokens.nextToken();
    }
    prevToken() {
        this.token = this.tokens.prevToken();
    }
    error(message) {
        Console_1.default.error(message + ' ' + this.tokens.get());
    }
}
exports.default = XprMetadataBuilder;
//# sourceMappingURL=XprMetadataBuilder.js.map