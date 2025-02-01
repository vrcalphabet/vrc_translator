"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Console_1 = __importDefault(require("./Console"));
const zod_1 = require("zod");
class IndexValidator {
    static schema = zod_1.z.object({
        input: zod_1.z.string().default('./'),
        output: zod_1.z.string().default('./'),
        ignore: zod_1.z.array(zod_1.z.string()).default([]),
        format: zod_1.z.boolean().default(false),
    });
    static validate(input) {
        try {
            const index = JSON.parse(input);
            return this.schema.parse(index);
        }
        catch (e) {
            if (e instanceof zod_1.z.ZodError) {
                Console_1.default.error('`index.json`のスキーマが不正です。', e.errors);
            }
            else {
                Console_1.default.error('`index.json`の構文が不正です。', e.message);
            }
            return null;
        }
    }
}
exports.default = IndexValidator;
//# sourceMappingURL=IndexValidator.js.map