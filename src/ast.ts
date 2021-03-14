import { TokenStreamLease } from './reader';

export class SyntaxNode {
    ruleName: String
    tokenStreamLease: TokenStreamLease
    children: SyntaxNode[] = []

    constructor(ruleName: string, tokenStreamLease: TokenStreamLease) {
        this.ruleName = ruleName
        this.tokenStreamLease = tokenStreamLease
    }

    addChild(child: SyntaxNode): void {
        this.children.push(child)
    }

    /**
     * In the event of failure to complete a rule match farther up in the tree, invoking the release method
     * will release this node's claim on any portion of the token stream.
     */
    release(): void {
        //TODO: safe?
        if (this.tokenStreamLease !== undefined) {
            this.tokenStreamLease.release()
        }
        //release the children nodes in reverse order
        for (var i = this.children.length - 1; i >= 0; i--) {
            this.children[i].release()
        }
        //TODO: how to clean up best. delete? set null?
    }
}