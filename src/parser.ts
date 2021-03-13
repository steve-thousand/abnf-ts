import * as abnf from "./abnf"

/**
 * IETF guide for Backus-Naur https://tools.ietf.org/html/rfc5234#section-4
 */

export function parseGrammar(grammar: string): abnf.Rule[] {
    return grammar.split("\n").map((line) => {
        return parseRule(line)
    })
}

export function parseRule(ruleDef: string): abnf.Rule {
    const ruleParts = ruleDef.split("=")
    const ruleName = ruleParts[0].trim()
    const elements = parseElements(ruleParts[1].trim())
    return new abnf.Rule(ruleName, elements)
}

type CrawlState = {
    index: 0
}

type RepetitionState = {
    atLeast: number
    atMost: number
}

function parseElements(elementsString: string, crawlState: CrawlState = { index: 0 }, terminateOn = undefined): abnf.RuleElement[] {
    const elements = []
    let repetitionState: RepetitionState = null
    while (crawlState.index < elementsString.length) {
        const char = elementsString[crawlState.index]
        if (char === terminateOn) {
            break
        }
        let element: abnf.RuleElement
        let innerElements: abnf.RuleElement[]
        switch (char) {
            case "\"":
                //string
                //TODO: smarter?
                const string = []
                crawlState.index++
                while (elementsString[crawlState.index] != "\"") {
                    string.push(elementsString[crawlState.index])
                    crawlState.index++
                }
                element = new abnf.Literal(string.join(""))
                break
            case "0":
            case "1":
            case "2":
            case "3":
            case "4":
            case "5":
            case "6":
            case "7":
            case "8":
            case "9":
            case "*":
                //repetition

                //build atLeast number
                let atLeastStr = []
                while (isDigit(elementsString[crawlState.index])) {
                    atLeastStr.push(elementsString[crawlState.index])
                    crawlState.index++
                }
                let atLeast = atLeastStr.length > 0 ? parseInt(atLeastStr.join("")) : 0

                let atMost
                if (elementsString[crawlState.index] == "*") {
                    crawlState.index++

                    //build atLeast number
                    let atMostStr = []
                    while (isDigit(elementsString[crawlState.index])) {
                        atMostStr.push(elementsString[crawlState.index])
                        crawlState.index++
                    }
                    crawlState.index--

                    atMost = atMostStr.length > 0 ? parseInt(atMostStr.join("")) : Infinity
                } else {
                    crawlState.index--
                    atMost = atLeast
                }
                repetitionState = {
                    atLeast: atLeast,
                    atMost: atMost
                }

                break
            case "[":
                //option
                crawlState.index++
                innerElements = parseElements(elementsString, crawlState, "]")
                element = new abnf.Optional(innerElements)
                break
            case "{":
                //group
                crawlState.index++
                innerElements = parseElements(elementsString, crawlState, "}")
                element = new abnf.Group(innerElements)
                break
            default:
                //if no other rules apply, we are probably crawling over a rule name
                if (isAlpha(char)) {
                    let ruleName = []
                    ruleName.push(char)
                    crawlState.index++
                    while (isAlpha(elementsString[crawlState.index]) ||
                        isDigit(elementsString[crawlState.index]) ||
                        elementsString[crawlState.index] === "-") {
                        ruleName.push(elementsString[crawlState.index])
                        crawlState.index++
                    }
                    crawlState.index--
                    element = new abnf.RuleRef(ruleName.join(""))
                }
        }

        if (element) {

            if (repetitionState) {
                elements.push(new abnf.Repetition(
                    repetitionState.atLeast,
                    repetitionState.atMost,
                    element
                ))
                repetitionState = null
            } else {
                elements.push(element)
            }
        }

        crawlState.index++
    }
    return elements
}

function isAlpha(char: string) {
    return (/^[a-zA-Z]$/).test(char)
}

function isDigit(char: string): boolean {
    return (/^[0-9]$/).test(char)
}