var __importDefault=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(exports,"__esModule",{value:!0});let XprBuilder_1=__importDefault(require("./XprBuilder")),XprTokenizer_1=__importDefault(require("./XprTokenizer"));class XprConverter{static convert(e){e=XprTokenizer_1.default.tokenize(e);XprBuilder_1.default.getInstance().buildTree(e)}}exports.default=XprConverter;