import { TokenStream, TokenStreamLease, TokenStreamPredicate, LiteralPredicate } from './reader';
import { SyntaxNode, RuleSyntaxNode, TokenSyntaxNode, SimpleSyntaxNode } from './ast'

export abstract class RuleElement {
    /**
     * Attempts to consume a portion of a TokenStream that matches this element.
     * @param stream {@link TokenStream} to attemp to consume
     * @return a {@link SyntaxNode} that claims a lease on a matching portion of the stream. null, if no match found
     */
    consume(stream: TokenStream): SyntaxNode {
        const lease: TokenStreamLease = stream.consume(this.getPredicate())
        if (lease !== null) {
            return new TokenSyntaxNode(lease)
        } else {
            return null
        }
    }

    abstract getPredicate(): TokenStreamPredicate
}

/**
 * An element referencing a {@link Rule} by name.
 */
export class RuleRef extends RuleElement {

    rule: Rule

    constructor(rule: Rule) {
        super()
        this.rule = rule
    }

    /**
     * Overrides superclass {@link RuleElement#consume} method to call {@link Rule#consume} on the contained 
     * {@link Rule} instance.
     * @override
     */
    consume(stream: TokenStream): SyntaxNode {
        return this.rule.consume(stream)
    }

    getPredicate(): TokenStreamPredicate {
        throw new Error('Method not implemented.');
    }
}

/**
 * A class wrapping a sequence of {@link RuleElement | RuleElements}. All elements must successfully match the token
 * stream.
 */
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

/**
 * Separates a series of rule element sets, and at least one must match the token stream.
 */
export class Alternative extends RuleElement {

    alternatives: RuleElement[]

    constructor(alternatives: RuleElement[]) {
        super()
        this.alternatives = alternatives
    }

    /**
     * Overrides superclass {@link RuleElement#consume} method to attempt matching on one of the contained alternative 
     * sequences
     * @override
     */
    consume(stream: TokenStream): SyntaxNode {
        for (let alternative of this.alternatives) {
            const node = alternative.consume(stream);
            if (node !== null) {
                return node
            }
        }
        //failed to find a match
        return null
    }

    getPredicate(): TokenStreamPredicate {
        throw new Error('Method not implemented.');
    }
}

/**
 * Represents a literal character sequence that must be matched exactly.
 */
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

/**
 * Wraps a {@link RuleElement} with the numerical information describing the minimum and maximum amount of times the
 * token stream must match it.
 */
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

    /**
     * Overrides superclass {@link RuleElement#consume} method to attempt matching multiple times, according to the
     * repetition minimum and maximum requirements.
     * @override
     */
    consume(stream: TokenStream): SyntaxNode {
        let matched = 0
        const wrapperNode = new SimpleSyntaxNode()
        while (true) {
            //exit early if we have reached the maximum amount
            if (matched > this.atMost) {
                break
            }
            const childNode = super.consume(stream)
            if (childNode == null) {
                break
            } else {
                wrapperNode.addChild(childNode)
            }
            matched++
        }

        //release and return null if we have not met the minimum requirement
        if (wrapperNode.children.length < this.atleast || wrapperNode.children.length > this.atMost) {
            wrapperNode.release()
            return null
        } else {
            return wrapperNode
        }
    }

    getPredicate(): TokenStreamPredicate {
        return this.element.getPredicate()
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
     * @param stream {@link TokenStream} to attemp to consume
     * @return an AST node that claims a lease on a matching portion of the stream. null, if no match found
     */
    consume(stream: TokenStream): RuleSyntaxNode {
        const node = new RuleSyntaxNode(this.name)
        for (let element of this.elements) {
            let childNode = element.consume(stream)
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