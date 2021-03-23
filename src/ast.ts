import { Rule } from './abnf';
import { TokenStreamLease } from './reader';

export class NodeArray extends Array<SyntaxNode> {
    constructor(...items: SyntaxNode[]) {
        super(...items)
        //apparently this is important?
        //https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work
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

interface RuleNameMixin {
    getRule(): string;
}

export abstract class SyntaxNode {

    private children: SyntaxNode[] = []

    withChild(child: SyntaxNode): SyntaxNode {
        this.children.push(child)
        return this
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

    private finalize() {
        const node = this
        for (let i = 0; i < node.children.length; i++) {
            let child = node.children[i]
            child.finalize()
            if (child instanceof ProtoTokenSyntaxNode) {
                const replacementNode = new TokenSyntaxNode(child.getRule(), child.getValue())
                for (let innerChild of child.getChildren()) {
                    replacementNode.withChild(innerChild)
                }
                node.children[i] = replacementNode
                replacementNode.finalize()
            }
        }
    }

    static finalize(root: SyntaxNode) {
        const tempRoot = new RuleSyntaxNode('').withChild(root)
        tempRoot.finalize()
        return tempRoot.getChildren()[0]
    }

    getChildren(): SyntaxNode[] {
        return this.children
    }
}

export class RuleSyntaxNode extends SyntaxNode implements RuleNameMixin {
    private rule: string

    constructor(rule: string) {
        super()
        this.rule = rule
    }

    getRule(): string {
        return this.rule
    }
}

export abstract class ProtoTokenSyntaxNode extends RuleSyntaxNode {
    private value: string

    constructor(rule: string, value: string) {
        super(rule)
        this.value = value
    }

    release(): void {
        //TODO: safe?
        //need to release this token stream lease
        const tokenStreamLease = this.getStreamLease()
        if (tokenStreamLease !== undefined) {
            tokenStreamLease.release()
        }
        super.release()
    }

    abstract getStreamLease(): TokenStreamLease

    getValue(): string {
        return this.value
    }
}

export class TokenSyntaxNode extends RuleSyntaxNode {

    private value: string

    constructor(rule: string, value: string) {
        super(rule)
        this.value = value
    }

    getValue(): string {
        return this.value
    }
}