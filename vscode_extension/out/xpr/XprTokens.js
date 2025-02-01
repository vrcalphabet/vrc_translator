"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class XprTokens {
    tokens;
    index;
    constructor() {
        this.tokens = [];
        this.index = -1;
    }
    add(...token) {
        this.tokens.push(...token);
    }
    peekToken() {
        if (this.index <= 0 || this.index >= this.tokens.length - 1) {
            return null;
        }
        return this.tokens[this.index + 1];
    }
    nextToken() {
        if (this.index >= this.tokens.length - 1) {
            return null;
        }
        return this.tokens[++this.index];
    }
    prevToken() {
        if (this.index <= 0) {
            return null;
        }
        return this.tokens[--this.index];
    }
    get(offset = 5) {
        const index = Math.max(0, Math.min(this.index, this.tokens.length - 1));
        const tokens = this.tokens.map((token, i) => (i === index ? `>>>${token}<<<` : token));
        const left = Math.max(0, this.index - offset);
        const right = Math.min(this.tokens.length, this.index + offset);
        return tokens.slice(left, right).join(' ');
    }
}
exports.default = XprTokens;
//# sourceMappingURL=XprTokens.js.map