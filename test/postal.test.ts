import { expect } from 'chai';
import { Parser, generateParser } from '../src/parser'
import { StringStream } from '../src/reader'
import { RuleSyntaxNode } from '../src/ast'

function getPostalAddressParser(): Parser {
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

    return generateParser(postalAddressGrammar)
}

describe('Postal Address tests', function () {
    const parser = getPostalAddressParser()
    describe('street-name tests', function () {
        it('"Fake" should match "street-name"', function () {
            const node: RuleSyntaxNode = parser.parse(new StringStream("Fake"), 'street-name')
            expect(node).to.not.be.null
            expect(node.ruleName).to.equal('street-name')
        });
    });
    describe('zip-part tests', function () {
        it('"Springfield, IL 55555\\r\\n" should match "zip-part"', function () {
            const node: RuleSyntaxNode = parser.parse(new StringStream("Springfield, IL 55555\r\n"), 'zip-part')
            expect(node).to.not.be.null
            expect(node.ruleName).to.equal('zip-part')
        });
    });
    describe('town-name tests', function () {
        it('"Springfield" should match "town-name"', function () {
            const node: RuleSyntaxNode = parser.parse(new StringStream("Springfield"), 'town-name')
            expect(node).to.not.be.null
            expect(node.ruleName).to.equal('town-name')
        })
        it('"New York" should match "town-name"', function () {
            const node: RuleSyntaxNode = parser.parse(new StringStream("New York"), 'town-name')
            expect(node).to.not.be.null
            expect(node.ruleName).to.equal('town-name')
        })
        it('"New York2" should not match "town-name"', function () {
            const node: RuleSyntaxNode = parser.parse(new StringStream("New York 2"), 'town-name')
            expect(node).to.be.null
        })
    })
    describe('state tests', function () {
        it('"AZ" should match "state"', function () {
            const node: RuleSyntaxNode = parser.parse(new StringStream("AZ"), 'state')
            expect(node).to.not.be.null
            expect(node.ruleName).to.equal('state')
        })
        it('"mn" should match "state"', function () {
            const node: RuleSyntaxNode = parser.parse(new StringStream("mn"), 'state')
            expect(node).to.not.be.null
            expect(node.ruleName).to.equal('state')
        })
        it('"Q" should not match "state"', function () {
            const node: RuleSyntaxNode = parser.parse(new StringStream("Q"), 'state')
            expect(node).to.be.null
        })
        it('"QQQ" should not match "state"', function () {
            const node: RuleSyntaxNode = parser.parse(new StringStream("QQQ"), 'state')
            expect(node).to.be.null
        })
    })
    describe('zip-code tests', function () {
        it('"55555" should match "zip-code"', function () {
            const node: RuleSyntaxNode = parser.parse(new StringStream("55555"), 'zip-code')
            expect(node).to.not.be.null
            expect(node.ruleName).to.equal('zip-code')
        })
        it('"55555-4444" should match "zip-code"', function () {
            const node: RuleSyntaxNode = parser.parse(new StringStream("55555-4444"), 'zip-code')
            expect(node).to.not.be.null
            expect(node.ruleName).to.equal('zip-code')
        })
        it('"5555" should not match "zip-code"', function () {
            const node: RuleSyntaxNode = parser.parse(new StringStream("5555"), 'zip-code')
            expect(node).to.be.null
        })
        it('"555555" should not match "zip-code"', function () {
            const node: RuleSyntaxNode = parser.parse(new StringStream("555555"), 'zip-code')
            expect(node).to.be.null
        })
        it('"55555-" FUCK should not match "zip-code"', function () {
            const node: RuleSyntaxNode = parser.parse(new StringStream("55555-"), 'zip-code')
            expect(node).to.be.null
        })
        it('"55555-4" should not match "zip-code"', function () {
            const node: RuleSyntaxNode = parser.parse(new StringStream("55555-4"), 'zip-code')
            expect(node).to.be.null
        })
    })
    // it('Should match: "John Doe\\r\\n123 Fake\\r\\nSpringfield, IL 55555\\r\\n"', function () {
    //     const node: RuleSyntaxNode = parser.parse(new StringStream("John Doe\r\n123 Fake\r\nSpringfield, IL 55555\r\n"), 'postal-address')
    //     expect(node).to.not.be.null
    //     expect(node.ruleName).to.equal('postal-address')
    // })
});