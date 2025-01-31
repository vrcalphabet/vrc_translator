import XprTokens from './XprTokens';
import XprMetadataBuilder from './XprMetadataBuilder';
import XprNodeBuilder from './XprNodeBuilder';
import { XprFile } from './xpr';

/** トークンからツリーを生成するクラス */
export default class XprBuilder {
  
  /**
   * 与えられたトークンから、トークンツリーを作成します。
   * @param tokens トークンの配列
   * @returns トークンツリー、null: エラーが発生した場合
   */
  public static buildTree(tokens: XprTokens): XprFile | null {
    /** メタデータのツリーを構築する */
    const metadataBuilder = XprMetadataBuilder.getInstance();
    /** ノードのツリーを構築する */
    const nodeBuilder = XprNodeBuilder.getInstance();

    /** メタデータのツリー */
    const metadata = metadataBuilder.buildTree(tokens);
    if (metadata === null) return null;
    /** ノードのツリー */
    const nodes = nodeBuilder.buildTree(tokens);
    if (nodes === null) return null;

    // メタデータとノードを結合
    return {
      ...metadata,
      nodes,
    } satisfies XprFile;
  }
}
