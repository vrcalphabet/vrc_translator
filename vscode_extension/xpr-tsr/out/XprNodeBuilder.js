"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const XprErrorMessages_1 = __importDefault(require("./XprErrorMessages"));
const XprRegExp_1 = __importDefault(require("./XprRegExp"));
const Console_1 = __importDefault(require("./Console"));
const xpr_1 = require("./xpr");
class XprNodeBuilder {
    tokens;
    token;
    static INSTANCE = new XprNodeBuilder();
    constructor() {
        this.token = null;
    }
    static getInstance() {
        return this.INSTANCE;
    }
    buildTree(tokens) {
        this.tokens = tokens;
        let key = null;
        let xpath = null;
        let multi = false;
        while (true) {
            this.nextToken();
            if (this.token === null) {
                Console_1.default.error(XprErrorMessages_1.default.GENERAL.INVALID_TOKEN_END);
                return null;
            }
            const type = this.checkType();
            if (type === null)
                return null;
            switch (type) {
                case xpr_1.XprValueType.KEY:
                    key = this.token;
                    break;
                case xpr_1.XprValueType.XPATH:
                    xpath = this.token;
                    break;
                case xpr_1.XprValueType.MULTI:
                    multi = true;
                    break;
                case xpr_1.XprValueType.ATTRIBUTE:
                    break;
                case xpr_1.XprValueType.BRACKET_OPEN:
                    console.log({ key, xpath, multi });
                    return null;
                case xpr_1.XprValueType.BRACKET_CLOSE:
                    break;
                case xpr_1.XprValueType.COMMA:
                    break;
            }
        }
    }
    checkType() {
        if (this.validateRegex(XprRegExp_1.default.KEY)) {
            return xpr_1.XprValueType.KEY;
        }
        if (this.validateRegex(XprRegExp_1.default.XPATH)) {
            return xpr_1.XprValueType.XPATH;
        }
        if (this.validateRegex(XprRegExp_1.default.MULTI)) {
            return xpr_1.XprValueType.MULTI;
        }
        if (this.validateRegex(XprRegExp_1.default.ATTRIBUTE)) {
            return xpr_1.XprValueType.ATTRIBUTE;
        }
        if (this.validateToken('{')) {
            return xpr_1.XprValueType.BRACKET_OPEN;
        }
        if (this.validateToken('}')) {
            return xpr_1.XprValueType.BRACKET_CLOSE;
        }
        if (this.validateToken(',')) {
            return xpr_1.XprValueType.COMMA;
        }
        Console_1.default.error(XprErrorMessages_1.default.GENERAL.INVALID_TOKEN);
        return null;
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
}
exports.default = XprNodeBuilder;
//# sourceMappingURL=XprNodeBuilder.js.map