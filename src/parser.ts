import * as abnf from './abnf'
import { TokenStream } from './reader';
import { SyntaxNode } from './ast';

export interface Parser {
  parse(stream: TokenStream, ruleName: string): SyntaxNode
}

export function generateParser(grammar: string): Parser {
  const rules: abnf.RuleMap = parseRules(grammar)
  const includingCoreRules: abnf.RuleMap = new Map
  rules.forEach((value: abnf.Rule, key: string) => {
    includingCoreRules.set(key, value)
  });
  CORE_RULES.forEach((value: abnf.Rule, key: string) => {
    includingCoreRules.set(key, value)
  });
  return {
    parse: function (stream: TokenStream, ruleName: string): SyntaxNode {
      //ugh.
      const rootRule: abnf.Rule = new abnf.Rule('root', new abnf.RuleRef(ruleName))
      const node = rootRule.consume(stream, includingCoreRules)
      if (stream.isEmpty()) {
        SyntaxNode.finalize(node)
        return node.getChildren()[0]
      } else {
        return null;
      }
    }
  }
}

export function parseRules(grammar: string, isCore = false): Map<string, abnf.Rule> {
  const rulesMap: abnf.RuleMap = new Map()
  const ruleStrings = grammar.split('\n');
  for (const ruleStr of ruleStrings) {
    parseRule(ruleStr, rulesMap, isCore);
  }
  return rulesMap
}

function parseRule(ruleDef: string, rules: abnf.RuleMap, isCore: boolean) {
  if (ruleDef.indexOf('=') === -1) {
    //no def on this line
    return null
  }

  const isAlternativDefintion = ruleDef.indexOf('=/') !== -1
  const ruleParts = ruleDef.split(/=\/?/)
  const ruleName = ruleParts[0].trim()
  try {
    const elements = parseElements(ruleParts[1].trim())
    const rule = new abnf.Rule(ruleName, elements.length == 1 ? elements[0] : new abnf.Group(elements), isCore)
    if (rule !== null) {
      if (isAlternativDefintion) {
        if (rules.has(ruleName)) {
          rules.get(ruleName).addAlternativeDefinition(rule)
        } else {
          throw 'Rule "${ruleName}" defined as an alternative definition, but no original definition exists.'
        }
      } else {
        rules.set(rule.name, rule)
      }
    }
  } catch (error) {
    throw `Failed to parse rule ${ruleName} due to: ${error}`
  }
}

type CrawlState = {
  index: number
}

type RepetitionState = {
  atLeast: number
  atMost: number
}

function consumeNumberValue(crawlState: CrawlState, elementsString: string, base: number) {
  const digitStr = []
  let digitFunction
  switch (base) {
    case 2:
      digitFunction = isBinaryDigit
      break
    case 10:
      digitFunction = isDigit
      break
    case 16:
      digitFunction = isHexDigit
      break
  }
  while (digitFunction(elementsString[crawlState.index])) {
    digitStr.push(elementsString[crawlState.index])
    crawlState.index++
  }
  return parseInt(digitStr.join(''), base)
}

function parseElements(elementsString: string, crawlState: CrawlState = { index: 0 }, terminateOn = undefined): abnf.RuleElement[] {
  const elements = []
  const alternative_indices: number[] = []
  let repetitionState: RepetitionState = null
  while (crawlState.index < elementsString.length) {
    const char = elementsString[crawlState.index]
    if (char === terminateOn) {
      break
    }
    let element: abnf.RuleElement
    let innerElements: abnf.RuleElement[]
    switch (char) {
      case ';':
        //comment, this line is done
        crawlState.index = elementsString.length
        break
      case '"': {
        //string
        //TODO: smarter?
        const string = []
        crawlState.index++
        while (elementsString[crawlState.index] != '"') {
          string.push(elementsString[crawlState.index])
          crawlState.index++
        }
        element = new abnf.Literal(string.join(''))
      } break
      case '0':
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
      case '*': {
        //repetition

        //build atLeast number
        const atLeastStr = []
        while (isDigit(elementsString[crawlState.index])) {
          atLeastStr.push(elementsString[crawlState.index])
          crawlState.index++
        }
        const atLeast = atLeastStr.length > 0 ? parseInt(atLeastStr.join('')) : 0

        let atMost
        if (elementsString[crawlState.index] == '*') {
          crawlState.index++

          //build atLeast number
          const atMostStr = []
          while (isDigit(elementsString[crawlState.index])) {
            atMostStr.push(elementsString[crawlState.index])
            crawlState.index++
          }
          crawlState.index--

          atMost = atMostStr.length > 0 ? parseInt(atMostStr.join('')) : Infinity
        } else {
          crawlState.index--
          atMost = atLeast
        }
        repetitionState = {
          atLeast: atLeast,
          atMost: atMost
        }

        break
      }
      case '[':
        //option
        crawlState.index++
        innerElements = parseElements(elementsString, crawlState, ']')
        element = new abnf.Optional(innerElements)
        break
      case '(':
        //group
        crawlState.index++
        innerElements = parseElements(elementsString, crawlState, ')')
        element = new abnf.Group(innerElements)
        break
      case '/':
        //alternative
        alternative_indices.push(elements.length)
        break
      case '%': {
        // character value or range
        crawlState.index++
        let base: number
        switch (elementsString[crawlState.index]) {
          case 'b':
            base = 2
            break
          case 'd':
            base = 10
            break
          case 'x':
            base = 16
            break
        }
        crawlState.index++
        const value: number = consumeNumberValue(crawlState, elementsString, base);
        if (elementsString[crawlState.index] === '-') {
          crawlState.index++
          const nextValue = consumeNumberValue(crawlState, elementsString, base)
          element = new abnf.CharRange(value, nextValue)
        } else {
          element = new abnf.CharRange(value, value)
        }

        break
      }
      default:
        //if no other rules apply, we are probably crawling over a rule name
        if (isAlpha(char)) {
          const ruleNameStr = []
          ruleNameStr.push(char)
          crawlState.index++
          while (isAlpha(elementsString[crawlState.index]) ||
            isDigit(elementsString[crawlState.index]) ||
            elementsString[crawlState.index] === '-') {
            ruleNameStr.push(elementsString[crawlState.index])
            crawlState.index++
          }
          crawlState.index--
          const ruleName = ruleNameStr.join('')
          element = new abnf.RuleRef(ruleName)
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

  if (alternative_indices.length > 0) {
    let lastIndex = 0
    const alternativeRuleSets = []
    for (const alternative_index of alternative_indices) {
      const slice = elements.slice(lastIndex, alternative_index)
      if (slice.length == 1) {
        alternativeRuleSets.push(slice[0])
      } else {
        alternativeRuleSets.push(new abnf.Group(slice))
      }
      lastIndex = alternative_index
    }
    const slice = elements.slice(lastIndex)
    if (slice.length == 1) {
      alternativeRuleSets.push(slice[0])
    } else {
      alternativeRuleSets.push(new abnf.Group(slice))
    }
    return [new abnf.Alternative(alternativeRuleSets)]
  }

  return elements
}

function isAlpha(char: string) {
  return (/^[a-zA-Z]$/).test(char)
}

function isBinaryDigit(char: string): boolean {
  return (/^[0-1]$/).test(char)
}

function isDigit(char: string): boolean {
  return (/^[0-9]$/).test(char)
}

function isHexDigit(char: string): boolean {
  return (/^[0-9A-Fa-f]$/).test(char)
}

//https://tools.ietf.org/html/rfc5234#appendix-B.1
const CORE_RULES_GRAMMAR = `
ALPHA          =  %x41-5A / %x61-7A   ; A-Z / a-z

BIT            =  "0" / "1"

CHAR           =  %x01-7F
                    ; any 7-bit US-ASCII character,
                    ;  excluding NUL

CR             =  %x0D
                    ; carriage return

CRLF           =  CR LF
                    ; Internet standard newline

CTL            =  %x00-1F / %x7F
                    ; controls

DIGIT          =  %x30-39
                    ; 0-9

DQUOTE         =  %x22
                    ; " (Double Quote)

HEXDIG         =  DIGIT / "A" / "B" / "C" / "D" / "E" / "F"

HTAB           =  %x09
                    ; horizontal tab

LF             =  %x0A
                    ; linefeed

LWSP           =  *(WSP / CRLF WSP)
                    ; Use of this linear-white-space rule
                    ;  permits lines containing only white
                    ;  space that are no longer legal in
                    ;  mail headers and have caused
                    ;  interoperability problems in other
                    ;  contexts.
                    ; Do not use when defining mail
                    ;  headers and use with caution in
                    ;  other contexts.

OCTET          =  %x00-FF
                    ; 8 bits of data

SP             =  %x20

VCHAR          =  %x21-7E
                    ; visible (printing) characters

WSP            =  SP / HTAB
                    ; white space
`

export const CORE_RULES = parseRules(CORE_RULES_GRAMMAR, true)