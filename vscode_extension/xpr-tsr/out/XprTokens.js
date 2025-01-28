"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class XprTokens {
    tokens;
    index;
    constructor() {
        this.tokens = [];
        this.index = 0;
    }
    add(...token) {
        this.tokens.push(...token);
    }
    nextToken() {
        if (this.index >= this.tokens.length) {
            return null;
        }
        return this.tokens[this.index++];
    }
    prevToken() {
        if (this.index <= 0) {
            return null;
        }
        return this.tokens[--this.index];
    }
}
exports.default = XprTokens;
//# sourceMappingURL=XprTokens.js.map