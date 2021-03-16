import { expect } from 'chai';
import { parseRules } from '../src/parser'
import { StringStream } from '../src/reader'
import { RuleSyntaxNode } from '../src/ast'

function getPostalAddressRule() {
    //https://en.wikipedia.org/wiki/Augmented_Backus%E2%80%93Naur_form#Example
    const postalAddressGrammar = `postal-address   = name-part street zip-part

name-part        = *(personal-part SP) last-name [SP suffix] CRLF
name-part        =/ personal-part CRLF

personal-part    = first-name / (initial ".")
first-name       = *ALPHA
initial          = ALPHA
last-name        = *ALPHA
suffix           = ("Jr." / "Sr." / 1*("I" / "V" / "X"))

street           = [apt SP] house-num SP street-name CRLF
apt              = 1*4DIGIT
house-num        = 1*8(DIGIT / ALPHA)
street-name      = 1*VCHAR

zip-part         = town-name "," SP state 1*2SP zip-code CRLF
town-name        = 1*(ALPHA / SP)
state            = 2ALPHA
zip-code         = 5DIGIT ["-" 4DIGIT]`

    const rules = parseRules(postalAddressGrammar)
    return rules[0]
}

//UNCOMMENT when we can support
// describe('Postal Address tests', function () {
//     it('Should match: "John Doe 123 Fake Street Springfield, IL 55555"', function () {
//         const node: RuleSyntaxNode = getPostalAddressRule().consume(new StringStream("John Doe 123 Fake Street Springfield, IL 55555"))
//         expect(node).to.not.be.null
//         expect(node.ruleName).to.equal('postal-address')
//     })
// });