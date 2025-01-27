import { XprRegExp } from "./xpr";

export default {
  IDENTIFIER: /^[A-Z0-9_]+$/,
  DIRECTORY_PATH: /^\/.*$/,
  KEY: /^[A-Z0-9_]+$/,
  XPATH: /^\/.*$/,
  ATTRIBUTE: /^\[a-zA-Z0-9-\]$/,
} as const satisfies XprRegExp;