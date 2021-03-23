import { TokenStream, TokenStreamLease, TokenStreamPredicate, LiteralPredicate, RangePredicate } from './reader';
import { SyntaxNode, RuleSyntaxNode, NodeArray, ProtoTokenSyntaxNode } from './ast'

export type RuleMap = Map<string, Rule>

export abstract class RuleElement {
  /**
   * Every {@link RuleElement} must define how it should consume a {@link TokenStream}
   * @param stream the {@link TokenStream} to consume
   */
  abstract consume(stream: TokenStream, rules: RuleMap): NodeArray
}

/**
 * An element referencing a {@link Rule} by name.
 */
export class RuleRef extends RuleElement {

  ruleName: string

  constructor(ruleName: string) {
    super()
    this.ruleName = ruleName
  }

  consume(stream: TokenStream, rules: RuleMap): NodeArray {
    if (!rules.has(this.ruleName)) {
      throw `Failed to find rule by name '${this.ruleName}'`
    }
    const rule = rules.get(this.ruleName)
    const node = rule.consume(stream, rules)
    if (node === null) {
      return null;
    } else {
      return new NodeArray(node)
    }
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

  consume(stream: TokenStream, rules: RuleMap): NodeArray {
    const nodeArray: NodeArray = new NodeArray()
    for (const element of this.elements) {
      const childrenNodes = element.consume(stream, rules)
      if (childrenNodes == null) {
        //failed to match on this element in the sequence
        nodeArray.release()
        return null
      } else {
        nodeArray.extend(childrenNodes)
      }
    }
    return nodeArray
  }
}

export class Group extends Sequence { }

/**
 * Wraps a group of elements that are optional, meaning that they must match the stream a minimum of 0 times and a 
 * maximum of 1 times
 */
export class Optional extends Sequence {

  private repetition: Repetition

  constructor(elements: RuleElement[]) {
    super(elements)
    //an Optional element is equal to an element wrapped in a Repetition of at most 1
    this.repetition = new Repetition(0, 1, new Group(elements))
  }

  consume(stream: TokenStream, rules: RuleMap): NodeArray {
    return this.repetition.consume(stream, rules)
  }
}

/**
 * Separates a series of rule element sets, and at least one must match the token stream.
 */
export class Alternative extends RuleElement {

  alternatives: RuleElement[]

  constructor(alternatives: RuleElement[]) {
    super()
    this.alternatives = alternatives
  }

  consume(stream: TokenStream, rules: RuleMap): NodeArray {
    for (const alternative of this.alternatives) {
      const node = alternative.consume(stream, rules);
      if (node !== null) {
        return node
      }
    }
    //failed to find a match
    return null
  }

  pushAlternative(ruleElement: RuleElement): void {
    this.alternatives.push(ruleElement)
  }
}

/**
 * A class which applies a {@link TokenStreamPredicate} to the {@link TokenStream} that it consumes.
 */
abstract class PredicateElement extends RuleElement {

  predicate: TokenStreamPredicate

  constructor(predicate: TokenStreamPredicate) {
    super()
    this.predicate = predicate
  }

  consume(stream: TokenStream): NodeArray {
    const lease: TokenStreamLease = stream.consume(this.predicate)
    if (lease !== null) {
      const tokenNode: ProtoTokenSyntaxNode = new class extends ProtoTokenSyntaxNode {
        getStreamLease(): TokenStreamLease {
          return lease
        }
      }(null, lease.getValue())
      return new NodeArray(tokenNode)
    } else {
      return null
    }
  }
}

/**
 * Represents a literal character sequence that must be matched exactly.
 */
export class Literal extends PredicateElement {
  constructor(value: string) {
    super(new LiteralPredicate(value))
  }
}

/**
 * Represents a decimal range that a character must fall within, inclusive.
 */
export class CharRange extends PredicateElement {
  constructor(minimum: number, maximum: number) {
    super(new RangePredicate(minimum, maximum))
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
  consume(stream: TokenStream, rules: RuleMap): NodeArray {
    let matched = 0
    const nodeArray: NodeArray = new NodeArray()
    while (matched < this.atMost) {
      const childrenNodes = this.element.consume(stream, rules)
      if (childrenNodes == null) {
        break
      } else {
        nodeArray.extend(childrenNodes)
      }
      matched++
    }

    //release and return null if we have not met the minimum requirement
    if (matched < this.atleast || matched > this.atMost) {
      nodeArray.release()
      return null
    } else {
      return nodeArray
    }
  }
}

/**
 * TODO: CONTROVERSIAL!!!
 * @param childrenNodes 
 * @param rules 
 * @returns 
 */
function reduceChildren(childrenNodes: NodeArray, ruleName: string, rules: RuleMap): SyntaxNode {
  let allTokens = true
  const tokenStr = []
  for (const childNode of childrenNodes) {
    if (!(childNode instanceof ProtoTokenSyntaxNode) ||
      (childNode.getRule() !== null && !rules.get(childNode.getRule()).isCore())) {
      allTokens = false
    } else {
      tokenStr.push(childNode.getValue())
    }
  }
  if (allTokens) {
    //TODO: is this cool or awful
    const node = new class extends ProtoTokenSyntaxNode {
      getStreamLease(): TokenStreamLease {
        throw new Error('Method not implemented.');
      }
      release(): void {
        childrenNodes.release()
      }
    }(ruleName, tokenStr.join(''))
    return node
  } else {
    const node = new RuleSyntaxNode(ruleName)
    for (const childNode of childrenNodes) {
      node.withChild(childNode)
    }
    return node
  }
}

/**
 * TODO: uhhh should these consume in the same way as the elements???
 * Maybe syntax nodes can only be constructed when a Rule is matched, not a rule element.
 */
export class Rule {

  name: string
  definition: RuleElement
  private _isCore: boolean

  constructor(name: string, definition: RuleElement, isCore = false) {
    this.name = name
    this.definition = definition
    this._isCore = isCore
  }

  /**
   * Attempts to consume a portion of a TokenStream that matches this element.
   * @param stream {@link TokenStream} to attemp to consume
   * @return an AST node that claims a lease on a matching portion of the stream. null, if no match found
   */
  consume(stream: TokenStream, rules: RuleMap): SyntaxNode {
    const childrenNodes = this.definition.consume(stream, rules)
    if (childrenNodes == null) {
      return null
    } else {
      return reduceChildren(childrenNodes, this.name, rules)
    }
  }

  addAlternativeDefinition(alternativeRule: Rule): void {
    if (this.definition instanceof Alternative) {
      (<Alternative>this.definition).pushAlternative(alternativeRule.definition)
    } else {
      this.definition = new Alternative([this.definition, alternativeRule.definition])
    }
  }

  isCore(): boolean {
    return this._isCore
  }
}
