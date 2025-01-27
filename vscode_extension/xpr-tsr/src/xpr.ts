export type XprMetadata = {
  name: string;
  includes: Array<string>;
  excludes: Array<string>;
};

export type XprFile = XprMetadata & {
  nodes: Array<XprParentNode | XprChildNode>;
};

export type XprParentNode = {
  key: string;
  xpath: string;
  nodes: Array<XprParentNode | XprChildNode>;
};

export type XprChildNode = {
  key: string | null;
  xpath: string;
  multi: boolean;
  attribute: string | null;
};

export type XprErrorMessageGroup = {
  [key: string]: XprErrorMessageBlock;
};

export type XprErrorMessageBlock = {
  [key: string]: string;
};

export type XprRegExp = {
  [key: string]: RegExp;
};