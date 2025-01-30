import XprTokens from './XprTokens';
import XprMetadataBuilder from './XprMetadataBuilder';
import XprNodeBuilder from './XprNodeBuilder';
import { XprFile } from './xpr';

export default class XprBuilder {
  public static buildTree(tokens: XprTokens): void {
    const metadataBuilder = XprMetadataBuilder.getInstance();
    const nodeBuilder = XprNodeBuilder.getInstance();

    const metadata = metadataBuilder.buildTree(tokens);
    if (metadata === null) return;
    const nodes = nodeBuilder.buildTree(tokens);
    if (nodes === null) return;

    const file = {
      ...metadata,
      nodes,
    } satisfies XprFile;
    console.log(JSON.stringify(file));
  }
}
