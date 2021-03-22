import { TokenStreamLease } from './reader';

export class NodeArray extends Array<SyntaxNode> {
    constructor(...items: SyntaxNode[]) {
        super(...items)
        Object.setPrototypeOf(this, NodeArray.prototype);
    }
    extend(nodeArray: NodeArray): void {
        for (let node of nodeArray) {
            this.push(node);
        }
    }
    release(): void {
        for (var i = this.length - 1; i >= 0; i--) {
            this[i].release();
        }
    }
}

export abstract class SyntaxNode {

    children: SyntaxNode[] = []

    addChild(child: SyntaxNode): void {
        this.children.push(child)
    }

    /**
     * In the event of failure to complete a rule match farther up in the tree, invoking the release method
     * will release this node's claim on any portion of the token stream.
     */
    release(): void {
        //release the children nodes in reverse order
        for (var i = this.children.length - 1; i >= 0; i--) {
            this.children[i].release()
        }
        //TODO: how to clean up best. delete? set null?
    }
}

export class SimpleSyntaxNode extends SyntaxNode {
    constructor() {
        super()
    }
}

export class TokenSyntaxNode extends SyntaxNode {

    private tokenStreamLease: TokenStreamLease

    constructor(tokenStreamLease: TokenStreamLease) {
        super()
        this.tokenStreamLease = tokenStreamLease
    }

    release(): void {
        //TODO: safe?
        //need to release this token stream lease
        if (this.tokenStreamLease !== undefined) {
            this.tokenStreamLease.release()
        }
        super.release()
    }
}

export class RuleSyntaxNode extends SyntaxNode {

    ruleName: String

    constructor(ruleName: string) {
        super()
        this.ruleName = ruleName
    }
}