Object.defineProperty(exports,"__esModule",{value:!0}),exports.XprTokens=exports.XprTokenizer=void 0;class XprTokenizer{static commentRegex=/%-.*?-%|%.*?(?=\n)/gs;static tokenize(e){e=e.replaceAll(this.commentRegex,"").split(/,|\n/);let s=new XprTokens;return e.forEach(e=>{0===e.trim().length||(e=e.trim().split(/\s+/),s.add(...e),e.includes("{"))||e.includes("}")||s.add(",")}),console.log(s),s}}exports.XprTokenizer=XprTokenizer;class XprTokens{tokens;index;constructor(){this.tokens=[],this.index=0}add(...e){this.tokens.push(...e)}nextToken(){return this.index>=this.tokens.length?null:this.tokens[this.index++]}}exports.XprTokens=XprTokens;