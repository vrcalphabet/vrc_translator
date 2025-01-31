"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const XprMetadataBuilder_1 = __importDefault(require("./XprMetadataBuilder"));
const XprNodeBuilder_1 = __importDefault(require("./XprNodeBuilder"));
class XprBuilder {
    static buildTree(tokens) {
        const metadataBuilder = XprMetadataBuilder_1.default.getInstance();
        const nodeBuilder = XprNodeBuilder_1.default.getInstance();
        const metadata = metadataBuilder.buildTree(tokens);
        if (metadata === null)
            return null;
        const nodes = nodeBuilder.buildTree(tokens);
        if (nodes === null)
            return null;
        return {
            ...metadata,
            nodes,
        };
    }
}
exports.default = XprBuilder;
//# sourceMappingURL=XprBuilder.js.map