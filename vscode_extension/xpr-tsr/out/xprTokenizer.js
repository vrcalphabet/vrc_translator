var __importDefault=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(exports,"__esModule",{value:!0});let XprTokens_1=__importDefault(require("./XprTokens"));class XprTokenizer{static commentRegex=/%-.*?-%|%.*?(?=\n)/gs;static tokenize(e){e=e.replaceAll(this.commentRegex,"").split(/,|\n/);let t=new XprTokens_1.default;return e.forEach(e=>{0===e.trim().length||(e=e.trim().split(/\s+/),t.add(...e),e.includes("{"))||e.includes("}")||t.add(",")}),console.log(t),t}}exports.default=XprTokenizer;