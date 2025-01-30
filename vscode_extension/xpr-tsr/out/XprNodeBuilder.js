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
        const nodes = [];
        while (true) {
            const node = this.recursive(false);
            if (node === null)
                return null;
            nodes.push(node);
            const token = this.peekToken();
            if (token === null)
                break;
        }
        return nodes;
    }
    recursive(baseMulti) {
        let key = null;
        let xpath = null;
        let multi = baseMulti;
        let attribute = null;
        const nodes = [];
        while (true) {
            this.nextToken();
            if (this.token === null) {
                this.error(XprErrorMessages_1.default.GENERAL.INVALID_TOKEN_END);
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
                    attribute = this.token.slice(1, -1);
                    break;
                case xpr_1.XprValueType.BRACKET_OPEN:
                    while (true) {
                        const node = this.recursive(multi);
                        if (node === null)
                            return null;
                        nodes.push(node);
                        const token = this.peekToken();
                        if (token === '}')
                            break;
                    }
                    break;
                case xpr_1.XprValueType.BRACKET_CLOSE:
                    if (key === null || xpath === null) {
                        this.error(XprErrorMessages_1.default.NODE.MISSING_KEY_OR_XPATH);
                        return null;
                    }
                    if (nodes.length === 0) {
                        this.error(XprErrorMessages_1.default.NODE.MISSING_NODE);
                        return null;
                    }
                    return {
                        key: key,
                        xpath: xpath,
                        nodes: nodes
                    };
                case xpr_1.XprValueType.COMMA:
                    if (xpath === null) {
                        this.error(XprErrorMessages_1.default.NODE.MISSING_XPATH);
                        return null;
                    }
                    return {
                        key: key,
                        xpath: xpath,
                        multi: multi,
                        attribute: attribute
                    };
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
        this.error(XprErrorMessages_1.default.GENERAL.INVALID_TOKEN);
        return null;
    }
    validateToken(...expectedTokens) {
        return this.token !== null && expectedTokens.includes(this.token);
    }
    validateRegex(regex) {
        return this.token !== null && regex.test(this.token);
    }
    peekToken() {
        return this.tokens.peekToken();
    }
    nextToken() {
        this.token = this.tokens.nextToken();
    }
    error(message) {
        Console_1.default.error(message + ' ' + this.tokens.get());
    }
}
exports.default = XprNodeBuilder;
//# sourceMappingURL=XprNodeBuilder.js.map