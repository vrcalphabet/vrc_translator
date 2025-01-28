import XprTokens from './XprTokens';
import XprMetadataBuilder from './XprMetadataBuilder';
import XprNodeBuilder from './XprNodeBuilder';

export default class XprBuilder {
  public static buildTree(tokens: XprTokens): void {
    const metadataBuilder = XprMetadataBuilder.getInstance();
    const nodeBuilder = XprNodeBuilder.getInstance();

    const metadata = metadataBuilder.buildTree(tokens);
    const node = nodeBuilder.buildTree(tokens);
    console.log(metadata);
    console.log(node);
  }
}
