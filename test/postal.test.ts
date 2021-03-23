import { expect } from 'chai';
import { Parser, generateParser } from '../src/parser'
import { StringStream } from '../src/reader'
import { SyntaxNode, RuleSyntaxNode, TokenSyntaxNode } from '../src/ast'

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
  describe('name-part tests', function () {
    it('"John Doe\\r\\n" should match "name-part"', function () {
      const node: SyntaxNode = parser.parse(new StringStream('John Doe\r\n'), 'name-part')
      expect(node).to.deep.equal(
        new RuleSyntaxNode('name-part')
          .withChild(
            new RuleSyntaxNode('personal-part')
              .withChild(new TokenSyntaxNode('first-name', 'John'))
          )
          .withChild(new TokenSyntaxNode('SP', ' '))
          .withChild(new TokenSyntaxNode('last-name', 'Doe'))
          .withChild(new TokenSyntaxNode('CRLF', '\r\n'))
      )
    })
  });
  describe('personal-part tests', function () {
    it('"John" should match "personal-part"', function () {
      const node: SyntaxNode = parser.parse(new StringStream('John'), 'personal-part')
      expect(node).to.deep.equal(new RuleSyntaxNode('personal-part')
        .withChild(new TokenSyntaxNode('first-name', 'John')))
    })
  });
  describe('street tests', function () {
    it('"12345 Fake\\r\\n" should match "street"', function () {
      const node: SyntaxNode = parser.parse(new StringStream('12345 Fake\r\n'), 'street')
      expect(node).to.deep.equal(
        new RuleSyntaxNode('street')
          .withChild(new TokenSyntaxNode('house-num', '12345'))
          .withChild(new TokenSyntaxNode('SP', ' '))
          .withChild(new TokenSyntaxNode('street-name', 'Fake'))
          .withChild(new TokenSyntaxNode('CRLF', '\r\n'))
      )
    });
  });
  describe('street-name tests', function () {
    it('"Fake" should match "street-name"', function () {
      const node: SyntaxNode = parser.parse(new StringStream('Fake'), 'street-name')
      expect(node).to.deep.equal(new TokenSyntaxNode('street-name', 'Fake'))
    });
  });
  describe('zip-part tests', function () {
    it('"Springfield, IL 55555\\r\\n" should match "zip-part"', function () {
      const node: SyntaxNode = parser.parse(new StringStream('Springfield, IL 55555\r\n'), 'zip-part')
      expect(node).to.deep.equal(
        new RuleSyntaxNode('zip-part')
          .withChild(new TokenSyntaxNode('town-name', 'Springfield'))
          .withChild(new TokenSyntaxNode(null, ','))
          .withChild(new TokenSyntaxNode('SP', ' '))
          .withChild(new TokenSyntaxNode('state', 'IL'))
          .withChild(new TokenSyntaxNode('SP', ' '))
          .withChild(new TokenSyntaxNode('zip-code', '55555'))
          .withChild(new TokenSyntaxNode('CRLF', '\r\n'))
      )
    });
  });
  describe('town-name tests', function () {
    it('"Springfield" should match "town-name"', function () {
      const node: SyntaxNode = parser.parse(new StringStream('Springfield'), 'town-name')
      expect(node).to.deep.equal(new TokenSyntaxNode('town-name', 'Springfield'))
    })
    it('"New York" should match "town-name"', function () {
      const node: SyntaxNode = parser.parse(new StringStream('New York'), 'town-name')
      expect(node).to.deep.equal(new TokenSyntaxNode('town-name', 'New York'))
    })
    it('"New York2" should not match "town-name"', function () {
      const node: SyntaxNode = parser.parse(new StringStream('New York 2'), 'town-name')
      expect(node).to.be.null
    })
  })
  describe('state tests', function () {
    it('"AZ" should match "state"', function () {
      const node: SyntaxNode = parser.parse(new StringStream('AZ'), 'state')
      expect(node).to.deep.equal(new TokenSyntaxNode('state', 'AZ'))
    })
    it('"mn" should match "state"', function () {
      const node: SyntaxNode = parser.parse(new StringStream('mn'), 'state')
      expect(node).to.deep.equal(new TokenSyntaxNode('state', 'mn'))
    })
    it('"Q" should not match "state"', function () {
      const node: SyntaxNode = parser.parse(new StringStream('Q'), 'state')
      expect(node).to.be.null
    })
    it('"QQQ" should not match "state"', function () {
      const node: SyntaxNode = parser.parse(new StringStream('QQQ'), 'state')
      expect(node).to.be.null
    })
  })
  describe('zip-code tests', function () {
    it('"55555" should match "zip-code"', function () {
      const node: SyntaxNode = parser.parse(new StringStream('55555'), 'zip-code')
      expect(node).to.deep.equal(new TokenSyntaxNode('zip-code', '55555'))
    })
    it('"55555-4444" should match "zip-code"', function () {
      const node: SyntaxNode = parser.parse(new StringStream('55555-4444'), 'zip-code')
      expect(node).to.deep.equal(new TokenSyntaxNode('zip-code', '55555-4444'))
    })
    it('"5555" should not match "zip-code"', function () {
      const node: SyntaxNode = parser.parse(new StringStream('5555'), 'zip-code')
      expect(node).to.be.null
    })
    it('"555555" should not match "zip-code"', function () {
      const node: SyntaxNode = parser.parse(new StringStream('555555'), 'zip-code')
      expect(node).to.be.null
    })
    it('"55555-" should not match "zip-code"', function () {
      const node: SyntaxNode = parser.parse(new StringStream('55555-'), 'zip-code')
      expect(node).to.be.null
    })
    it('"55555-4" should not match "zip-code"', function () {
      const node: SyntaxNode = parser.parse(new StringStream('55555-4'), 'zip-code')
      expect(node).to.be.null
    })
  })
  it('Should match: "John Doe\\r\\n12345 Fake\\r\\nSpringfield, IL 55555\\r\\n"', function () {
    const node: SyntaxNode = parser.parse(new StringStream('John Doe\r\n12345 Fake\r\nSpringfield, IL 55555\r\n'), 'postal-address')
    expect(node).to.deep.equal(
      new RuleSyntaxNode('postal-address')
        .withChild(new RuleSyntaxNode('name-part')
          .withChild(
            new RuleSyntaxNode('personal-part')
              .withChild(new TokenSyntaxNode('first-name', 'John'))
          )
          .withChild(new TokenSyntaxNode('SP', ' '))
          .withChild(new TokenSyntaxNode('last-name', 'Doe'))
          .withChild(new TokenSyntaxNode('CRLF', '\r\n'))
        )
        .withChild(new RuleSyntaxNode('street')
          .withChild(new TokenSyntaxNode('house-num', '12345'))
          .withChild(new TokenSyntaxNode('SP', ' '))
          .withChild(new TokenSyntaxNode('street-name', 'Fake'))
          .withChild(new TokenSyntaxNode('CRLF', '\r\n'))
        )
        .withChild(new RuleSyntaxNode('zip-part')
          .withChild(new TokenSyntaxNode('town-name', 'Springfield'))
          .withChild(new TokenSyntaxNode(null, ','))
          .withChild(new TokenSyntaxNode('SP', ' '))
          .withChild(new TokenSyntaxNode('state', 'IL'))
          .withChild(new TokenSyntaxNode('SP', ' '))
          .withChild(new TokenSyntaxNode('zip-code', '55555'))
          .withChild(new TokenSyntaxNode('CRLF', '\r\n'))
        )
    )
  })
});