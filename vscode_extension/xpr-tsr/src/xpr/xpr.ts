/** トークンの種類 */
export enum XprValueType {
  KEY,
  XPATH,
  MULTI,
  ATTRIBUTE,
  /** 波括弧の左(`{`) */
  BRACKET_OPEN,
  /** 波括弧の右(`}`) */
  BRACKET_CLOSE,
  /** カンマ(`,`) */
  COMMA,
}

/** メタデータ */
export type XprMetadata = {
  name: string;
  includes: Array<string>;
  excludes: Array<string>;
};

/** ノードデータ */
export type XprNodes = Array<XprParentNode | XprChildNode>;

/** メタデータとノードデータの融合 */
export type XprFile = XprMetadata & {
  nodes: XprNodes;
};

/** 子を持つことができる親ノード */
export type XprParentNode = {
  key: string;
  xpath: string;
  nodes: Array<XprParentNode | XprChildNode>;
};

/** 子ノード */
export type XprChildNode = {
  key: string | null;
  xpath: string;
  multi: boolean;
  attribute: string | null;
};

/** エラーメッセージ */
export type XprErrorMessageGroup = {
  [key: string]: XprErrorMessageBlock;
};

/** エラーメッセージのブロック */
export type XprErrorMessageBlock = {
  [key: string]: string;
};

/** 正規表現 */
export type XprRegExp = {
  [key: string]: RegExp;
};
