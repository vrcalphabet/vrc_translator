"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const XprTokens_1 = __importDefault(require("./XprTokens"));
const XprRegExp_1 = __importDefault(require("./XprRegExp"));
class XprTokenizer {
    static tokenize(input) {
        const strippedInput = input.replaceAll(XprRegExp_1.default.COMMENT, '');
        const lines = strippedInput.split(/\n/);
        const tokens = new XprTokens_1.default();
        lines.forEach((line) => {
            if (line.trim().length === 0) {
                return;
            }
            const splittedTokens = line.trim().split(/\s+/);
            tokens.add(...splittedTokens);
            if (!splittedTokens.includes('{') && !splittedTokens.includes('}')) {
                tokens.add(',');
            }
        });
        return tokens;
    }
}
exports.default = XprTokenizer;
//# sourceMappingURL=XprTokenizer.js.map