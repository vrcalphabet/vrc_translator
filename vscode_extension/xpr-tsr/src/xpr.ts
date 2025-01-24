export type XprFile = {
  name: string;
  includes: Array<string>;
  excludes: Array<string>;
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
