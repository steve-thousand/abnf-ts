import { TokenStream, TokenStreamLease, TokenStreamPredicate, LiteralPredicate } from './reader';
import { SyntaxNode } from './ast'

export interface AST {

}

export abstract class RuleElement {
    /**
     * Attempts to consume a portion of a TokenStream that matches this element.
     * @param stream {@type TokenStream} to attemp to consume
     * @return an AST node that claims a lease on a matching portion of the stream. null, if no match found
     */
    consume(stream: TokenStream): SyntaxNode {
        const lease: TokenStreamLease = stream.consume(this.getPredicate())
        if (lease !== null) {
            return new SyntaxNode(undefined, lease)
        } else {
            return null
        }
    }

    abstract getPredicate(): TokenStreamPredicate
}

export class RuleRef extends RuleElement {

    rule: Rule

    constructor(rule: Rule) {
        super()
        this.rule = rule
    }

    getPredicate(): TokenStreamPredicate {
        throw new Error('Method not implemented.');
    }
}

abstract class Sequence extends RuleElement {

    elements: RuleElement[]

    constructor(elements: RuleElement[]) {
        super()
        this.elements = elements;
    }

    getPredicate(): TokenStreamPredicate {
        throw new Error('Method not implemented.');
    }
}

export class Group extends Sequence { }
export class Optional extends Sequence { }

export class Alternative extends RuleElement {

    alternativeElementSets: RuleElement[][]

    constructor(alternativeElementSets: RuleElement[][]) {
        super()
        this.alternativeElementSets = alternativeElementSets
    }

    getPredicate(): TokenStreamPredicate {
        throw new Error('Method not implemented.');
    }
}

export class Literal extends RuleElement {

    predicate: TokenStreamPredicate

    constructor(value: string) {
        super()
        this.predicate = new LiteralPredicate(value)
    }

    getPredicate(): TokenStreamPredicate {
        return this.predicate
    }
}

export class Repetition extends RuleElement {

    atleast: number
    atMost: number
    element: RuleElement

    constructor(atleast: number, atMost: number, element: RuleElement) {
        super()
        this.atleast = atleast
        this.atMost = atMost
        this.element = element
    }

    getPredicate(): TokenStreamPredicate {
        throw new Error('Method not implemented.');
    }
}

/**
 * TODO: uhhh should these consume in the same way as the elements???
 * Maybe syntax nodes can only be constructed when a Rule is matched, not a rule element.
 */
export class Rule {

    name: string
    elements: RuleElement[]

    constructor(name: string, elements: RuleElement[]) {
        this.name = name
        this.elements = elements
    }

    /**
     * Attempts to consume a portion of a TokenStream that matches this element.
     * @param stream {@type TokenStream} to attemp to consume
     * @return an AST node that claims a lease on a matching portion of the stream. null, if no match found
     */
    consume(stream: TokenStream): SyntaxNode {
        const node = new SyntaxNode(this.name, undefined)
        for (let element of this.elements) {
            let childNode
            if (element instanceof RuleRef) {
                //TODO: better
                childNode = (<RuleRef>element).rule.consume(stream)
            } else {
                childNode = element.consume(stream)
            }
            if (childNode == null) {
                node.release()
                return null
            } else {
                node.addChild(childNode)
            }
        }
        return node
    }
}