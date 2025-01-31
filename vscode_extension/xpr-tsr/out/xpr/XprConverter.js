"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const XprBuilder_1 = __importDefault(require("./XprBuilder"));
const XprTokenizer_1 = __importDefault(require("./XprTokenizer"));
class XprConverter {
    static convert(input) {
        const tokens = XprTokenizer_1.default.tokenize(input);
        return XprBuilder_1.default.buildTree(tokens);
    }
}
exports.default = XprConverter;
//# sourceMappingURL=XprConverter.js.map