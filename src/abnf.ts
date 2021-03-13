export interface RuleElement {

}

abstract class Sequence implements RuleElement {
    elements: RuleElement[]
    constructor(elements: RuleElement[]) {
        this.elements = elements;
    }
}

export class Group extends Sequence { }
export class Optional extends Sequence { }

export class Literal implements RuleElement {
    value: string
    constructor(value: string) {
        this.value = value
    }
}

export class Repetition implements RuleElement {
    atleast: number
    atMost: number
    element: RuleElement
    constructor(atleast: number, atMost: number, element: RuleElement) {
        this.atleast = atleast
        this.atMost = atMost
        this.element = element
    }
}

export class Rule {
    name: string
    elements: RuleElement[]
    constructor(name: string, elements: RuleElement[]) {
        this.name = name
        this.elements = elements
    }
}