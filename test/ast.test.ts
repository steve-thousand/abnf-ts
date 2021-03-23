import { expect } from 'chai';
import { generateParser } from '../src/parser'
import { StringStream } from '../src/reader'
import { RuleSyntaxNode, SyntaxNode, TokenSyntaxNode } from '../src/ast'

describe('AST tests', function () {

  describe('Literal concatenation', function () {
    describe('murmur = foo bar foo, foo = "foo", bar = "bar"', function () {
      const parser = generateParser(
        `murmur = foo bar foo
                foo = "foo"
                bar = "bar"`
      )

      it('"foo" should match foo', function () {
        const node: SyntaxNode = parser.parse(new StringStream('foo'), 'foo')
        expect(node).to.deep.equal(new TokenSyntaxNode('foo', 'foo'))
      });

      it('"fo" should not match foo', function () {
        const node: SyntaxNode = parser.parse(new StringStream('fo'), 'foo')
        expect(node).to.be.null
      });

      it('"bar" should not match foo', function () {
        const node: SyntaxNode = parser.parse(new StringStream('bar'), 'foo')
        expect(node).to.be.null
      });

      it('"bar" should match bar', function () {
        const node: SyntaxNode = parser.parse(new StringStream('bar'), 'bar')
        expect(node).to.deep.equal(new TokenSyntaxNode('bar', 'bar'))
      });

      it('"ba" should not match bar', function () {
        const node: SyntaxNode = parser.parse(new StringStream('ba'), 'bar')
        expect(node).to.be.null
      });

      it('"foo" should not match bar', function () {
        const node: SyntaxNode = parser.parse(new StringStream('foo'), 'bar')
        expect(node).to.be.null
      });

      it('"foobarfoo" should match murmur', function () {
        const node: SyntaxNode = parser.parse(new StringStream('foobarfoo'), 'murmur')
        expect(node).to.deep.equal(new RuleSyntaxNode('murmur')
          .withChild(new TokenSyntaxNode('foo', 'foo'))
          .withChild(new TokenSyntaxNode('bar', 'bar'))
          .withChild(new TokenSyntaxNode('foo', 'foo'))
        )
      });
    })
  })

  describe('Value range', function () {
    describe('foo = %b1100010', function () {
      const parser = generateParser('foo = %b1100010')
      it('"a" should not match foo', function () {
        const node: SyntaxNode = parser.parse(new StringStream('a'), 'foo')
        expect(node).to.be.null
      });
      it('"b" should match foo', function () {
        const node: SyntaxNode = parser.parse(new StringStream('b'), 'foo')
        expect(node).to.deep.equal(new TokenSyntaxNode('foo', 'b'))
      });
      it('"c" should not match foo', function () {
        const node: SyntaxNode = parser.parse(new StringStream('c'), 'foo')
        expect(node).to.be.null
      });
    })
    describe('foo = %b1100010-1100100', function () {
      const parser = generateParser('foo = %b1100010-1100100')
      it('"a" should not match foo', function () {
        const node: SyntaxNode = parser.parse(new StringStream('a'), 'foo')
        expect(node).to.be.null
      });
      it('"b" should match foo', function () {
        const node: SyntaxNode = parser.parse(new StringStream('b'), 'foo')
        expect(node).to.deep.equal(new TokenSyntaxNode('foo', 'b'))
      });
      it('"c" should match foo', function () {
        const node: SyntaxNode = parser.parse(new StringStream('c'), 'foo')
        expect(node).to.deep.equal(new TokenSyntaxNode('foo', 'c'))
      });
      it('"d" should match foo', function () {
        const node: SyntaxNode = parser.parse(new StringStream('d'), 'foo')
        expect(node).to.deep.equal(new TokenSyntaxNode('foo', 'd'))
      });
      it('"e" should not match foo', function () {
        const node: SyntaxNode = parser.parse(new StringStream('e'), 'foo')
        expect(node).to.be.null
      });
    })
    describe('foo = %d98', function () {
      const parser = generateParser('foo = %d98')
      it('"a" should not match foo', function () {
        const node: SyntaxNode = parser.parse(new StringStream('a'), 'foo')
        expect(node).to.be.null
      });
      it('"b" should match foo', function () {
        const node: SyntaxNode = parser.parse(new StringStream('b'), 'foo')
        expect(node).to.deep.equal(new TokenSyntaxNode('foo', 'b'))
      });
      it('"c" should not match foo', function () {
        const node: SyntaxNode = parser.parse(new StringStream('c'), 'foo')
        expect(node).to.be.null
      });
    })
    describe('foo = %d98-100', function () {
      const parser = generateParser('foo = %d98-100')
      it('"a" should not match foo', function () {
        const node: SyntaxNode = parser.parse(new StringStream('a'), 'foo')
        expect(node).to.be.null
      });
      it('"b" should match foo', function () {
        const node: SyntaxNode = parser.parse(new StringStream('b'), 'foo')
        expect(node).to.deep.equal(new TokenSyntaxNode('foo', 'b'))
      });
      it('"c" should match foo', function () {
        const node: SyntaxNode = parser.parse(new StringStream('c'), 'foo')
        expect(node).to.deep.equal(new TokenSyntaxNode('foo', 'c'))
      });
      it('"d" should match foo', function () {
        const node: SyntaxNode = parser.parse(new StringStream('d'), 'foo')
        expect(node).to.deep.equal(new TokenSyntaxNode('foo', 'd'))
      });
      it('"e" should not match foo', function () {
        const node: SyntaxNode = parser.parse(new StringStream('e'), 'foo')
        expect(node).to.be.null
      });
    })
    describe('foo = %x62', function () {
      const parser = generateParser('foo = %x62')
      it('"a" should not match foo', function () {
        const node: SyntaxNode = parser.parse(new StringStream('a'), 'foo')
        expect(node).to.be.null
      });
      it('"b" should match foo', function () {
        const node: SyntaxNode = parser.parse(new StringStream('b'), 'foo')
        expect(node).to.deep.equal(new TokenSyntaxNode('foo', 'b'))
      });
      it('"c" should not match foo', function () {
        const node: SyntaxNode = parser.parse(new StringStream('c'), 'foo')
        expect(node).to.be.null
      });
    })
    describe('foo = %x62-64', function () {
      const parser = generateParser('foo = %x62-64')
      it('"a" should not match foo', function () {
        const node: SyntaxNode = parser.parse(new StringStream('a'), 'foo')
        expect(node).to.be.null
      });
      it('"b" should match foo', function () {
        const node: SyntaxNode = parser.parse(new StringStream('b'), 'foo')
        expect(node).to.deep.equal(new TokenSyntaxNode('foo', 'b'))
      });
      it('"c" should match foo', function () {
        const node: SyntaxNode = parser.parse(new StringStream('c'), 'foo')
        expect(node).to.deep.equal(new TokenSyntaxNode('foo', 'c'))
      });
      it('"d" should match foo', function () {
        const node: SyntaxNode = parser.parse(new StringStream('d'), 'foo')
        expect(node).to.deep.equal(new TokenSyntaxNode('foo', 'd'))
      });
      it('"e" should not match foo', function () {
        const node: SyntaxNode = parser.parse(new StringStream('e'), 'foo')
        expect(node).to.be.null
      });
    })
  })

  describe('Repetition', function () {
    describe('foo = 2*4"abc"', function () {
      const parser = generateParser('foo = 2*4"abc"')

      it('"abc" should not match foo', function () {
        const node: SyntaxNode = parser.parse(new StringStream('abc'), 'foo')
        expect(node).to.be.null
      });
      it('"abcabc" should match foo', function () {
        const node: SyntaxNode = parser.parse(new StringStream('abcabc'), 'foo')
        expect(node).to.deep.equal(new TokenSyntaxNode('foo', 'abcabc'))
      });
      it('"abcabcabc" should match foo', function () {
        const node: SyntaxNode = parser.parse(new StringStream('abcabcabc'), 'foo')
        expect(node).to.deep.equal(new TokenSyntaxNode('foo', 'abcabcabc'))
      });
      it('"abcabcabcabc" should match foo', function () {
        const node: SyntaxNode = parser.parse(new StringStream('abcabcabcabc'), 'foo')
        expect(node).to.deep.equal(new TokenSyntaxNode('foo', 'abcabcabcabc'))
      });
    });
    describe('foo = 0*1"abc"', function () {
      const parser = generateParser('foo = 0*1"abc"')

      it('"" should match foo', function () {
        const node: SyntaxNode = parser.parse(new StringStream(''), 'foo')
        expect(node).to.deep.equal(new TokenSyntaxNode('foo', ''))
      });
      it('"abc" should match foo', function () {
        const node: SyntaxNode = parser.parse(new StringStream('abc'), 'foo')
        expect(node).to.deep.equal(new TokenSyntaxNode('foo', 'abc'))
      });
    });
    describe('foo = *1"abc"', function () {
      const parser = generateParser('foo = *1"abc"')

      it('"" should match foo', function () {
        const node: SyntaxNode = parser.parse(new StringStream(''), 'foo')
        expect(node).to.deep.equal(new TokenSyntaxNode('foo', ''))
      });
      it('"abc" should match foo', function () {
        const node: SyntaxNode = parser.parse(new StringStream('abc'), 'foo')
        expect(node).to.deep.equal(new TokenSyntaxNode('foo', 'abc'))
      });
    });
    describe('foo = *"abc"', function () {
      const parser = generateParser('foo = *"abc"')

      it('"" should match foo', function () {
        const node: SyntaxNode = parser.parse(new StringStream(''), 'foo')
        expect(node).to.deep.equal(new TokenSyntaxNode('foo', ''))
      });
      it('"abc" should match foo', function () {
        const node: SyntaxNode = parser.parse(new StringStream('abc'), 'foo')
        expect(node).to.deep.equal(new TokenSyntaxNode('foo', 'abc'))
      });
      it('"abcabc" should match foo', function () {
        const node: SyntaxNode = parser.parse(new StringStream('abcabc'), 'foo')
        expect(node).to.deep.equal(new TokenSyntaxNode('foo', 'abcabc'))
      });
      it('"abcabcabcabcabcabcabcabc" should match foo', function () {
        const node: SyntaxNode = parser.parse(new StringStream('abcabcabcabcabcabcabcabc'), 'foo')
        expect(node).to.deep.equal(new TokenSyntaxNode('foo', 'abcabcabcabcabcabcabcabc'))
      });
    });
  })

  describe('Alternation', function () {
    describe('foo = "abc" / "xyz" "123" / "def"', function () {
      const parser = generateParser('foo = "abc" / "xyz" "123" / "def"')
      it('"abc" should match foo', function () {
        const node: SyntaxNode = parser.parse(new StringStream('abc'), 'foo')
        expect(node).to.deep.equal(new TokenSyntaxNode('foo', 'abc'))
      });
      it('"xyz123" should match foo', function () {
        const node: SyntaxNode = parser.parse(new StringStream('xyz123'), 'foo')
        expect(node).to.deep.equal(new TokenSyntaxNode('foo', 'xyz123'))
      });
      it('"xyz" should not match foo', function () {
        const node: SyntaxNode = parser.parse(new StringStream('xyz'), 'foo')
        expect(node).to.be.null
      });
      it('"def" should match foo', function () {
        const node: SyntaxNode = parser.parse(new StringStream('def'), 'foo')
        expect(node).to.deep.equal(new TokenSyntaxNode('foo', 'def'))
      });
    });
  });

  describe('Optional group', function () {
    describe('foo = "abc" ["xyz"] "def"', function () {
      const parser = generateParser('foo = "abc" ["xyz"] "def"')
      it('"abcdef" should match foo', function () {
        const node: SyntaxNode = parser.parse(new StringStream('abcdef'), 'foo')
        expect(node).to.deep.equal(new TokenSyntaxNode('foo', 'abcdef'))
      });
      it('"abcxyzdef" should match foo', function () {
        const node: SyntaxNode = parser.parse(new StringStream('abcxyzdef'), 'foo')
        expect(node).to.deep.equal(new TokenSyntaxNode('foo', 'abcxyzdef'))
      });
      it('"abc" should not match foo', function () {
        const node: SyntaxNode = parser.parse(new StringStream('abc'), 'foo')
        expect(node).to.be.null
      });
      it('"xyz" should not match foo', function () {
        const node: SyntaxNode = parser.parse(new StringStream('xyz'), 'foo')
        expect(node).to.be.null
      });
      it('"def" should not match foo', function () {
        const node: SyntaxNode = parser.parse(new StringStream('def'), 'foo')
        expect(node).to.be.null
      });
    });
  });
});