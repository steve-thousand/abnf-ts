import { expect } from 'chai';
import { parseRules } from '../src/parser'
import { StringStream } from '../src/reader'
import { RuleSyntaxNode } from '../src/ast'

describe('AST tests', function () {

    describe('Literal concatenation', function () {
        describe('murmur = foo bar foo, foo = "foo", bar = "bar"', function () {
            const rules = parseRules(
                `murmur = foo bar foo
                foo = "foo"
                bar = "bar"`
            )

            const murmur = rules[0]
            const foo = rules[1]
            const bar = rules[2]

            it('"foo" should match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("foo"))
                expect(node).to.not.be.null
                expect(node.ruleName).to.equal('foo')
            });

            it('"fo" should not match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("fo"))
                expect(node).to.be.null
            });

            it('"bar" should not match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("bar"))
                expect(node).to.be.null
            });

            it('"bar" should match bar', function () {
                const node: RuleSyntaxNode = bar.consume(new StringStream("bar"))
                expect(node).to.not.be.null
                expect(node.ruleName).to.equal('bar')
            });

            it('"ba" should not match bar', function () {
                const node: RuleSyntaxNode = bar.consume(new StringStream("ba"))
                expect(node).to.be.null
            });

            it('"foo" should not match bar', function () {
                const node: RuleSyntaxNode = bar.consume(new StringStream("foo"))
                expect(node).to.be.null
            });

            it('"foobarfoo" should match murmur', function () {
                const node: RuleSyntaxNode = murmur.consume(new StringStream("foobarfoo"))
                expect(node).to.not.be.null
                expect(node.ruleName).to.equal('murmur')

                expect(node.children.length).to.equal(3)
                expect((<RuleSyntaxNode>node.children[0]).ruleName).to.equal('foo')
                expect((<RuleSyntaxNode>node.children[1]).ruleName).to.equal('bar')
                expect((<RuleSyntaxNode>node.children[2]).ruleName).to.equal('foo')
            });
        })
    })

    describe('Repetition', function () {
        describe('foo = 2*4"abc"', function () {
            const rules = parseRules('foo = 2*4"abc"')
            const foo = rules[0]

            it('"abc" should not match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("abc"))
                expect(node).to.be.null
            });
            it('"abcabc" should match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("abcabc"))
                expect(node).to.not.be.null
                expect(node.ruleName).to.equal('foo')
            });
            it('"abcabcabc" should match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("abcabcabc"))
                expect(node).to.not.be.null
                expect(node.ruleName).to.equal('foo')
            });
            it('"abcabcabcabc" should match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("abcabcabcabc"))
                expect(node).to.not.be.null
                expect(node.ruleName).to.equal('foo')
            });
            it('"abcabcabcabcabc" should not match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("abcabcabcabcabc"))
                expect(node).to.be.null
            });
        });
        describe('foo = 0*1"abc"', function () {
            const rules = parseRules('foo = 0*1"abc"')
            const foo = rules[0]

            it('"" should match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream(""))
                expect(node).to.not.be.null
                expect(node.ruleName).to.equal('foo')
            });
            it('"abc" should match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("abc"))
                expect(node).to.not.be.null
                expect(node.ruleName).to.equal('foo')
            });
            it('"abcabc" should not match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("abcabc"))
                expect(node).to.be.null
            });
        });
        describe('foo = *1"abc"', function () {
            const rules = parseRules('foo = *1"abc"')
            const foo = rules[0]

            it('"" should match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream(""))
                expect(node).to.not.be.null
                expect(node.ruleName).to.equal('foo')
            });
            it('"abc" should match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("abc"))
                expect(node).to.not.be.null
                expect(node.ruleName).to.equal('foo')
            });
            it('"abcabc" should not match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("abcabc"))
                expect(node).to.be.null
            });
        });
        describe('foo = *"abc"', function () {
            const rules = parseRules('foo = *"abc"')
            const foo = rules[0]

            it('"" should match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream(""))
                expect(node).to.not.be.null
                expect(node.ruleName).to.equal('foo')
            });
            it('"abc" should match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("abc"))
                expect(node).to.not.be.null
                expect(node.ruleName).to.equal('foo')
            });
            it('"abcabc" should match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("abcabc"))
                expect(node).to.not.be.null
                expect(node.ruleName).to.equal('foo')
            });
            it('"abcabcabcabcabcabcabcabc" should match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("abcabcabcabcabcabcabcabc"))
                expect(node).to.not.be.null
                expect(node.ruleName).to.equal('foo')
            });
        });
    })

    describe('Alternation', function () {
        describe('foo = "abc" / "xyz" "123" / "def"', function () {
            const rules = parseRules('foo = "abc" / "xyz" "123" / "def"')
            const foo = rules[0]

            it('"abc" should match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("abc"))
                expect(node).to.not.be.null
                expect(node.ruleName).to.equal('foo')
            });
            it('"xyz123" should match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("xyz123"))
                expect(node).to.not.be.null
                expect(node.ruleName).to.equal('foo')
            });
            it('"xyz" should not match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("xyz"))
                expect(node).to.be.null
            });
            it('"def" should match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("def"))
                expect(node).to.not.be.null
                expect(node.ruleName).to.equal('foo')
            });
        });
    });

    describe('Optional group', function () {
        describe('foo = "abc" ["xyz"] "def"', function () {
            const rules = parseRules('foo = "abc" ["xyz"] "def"')
            const foo = rules[0]

            it('"abcdef" should match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("abcdef"))
                expect(node).to.not.be.null
                expect(node.ruleName).to.equal('foo')
            });
            it('"abcxyzdef" should match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("abcxyzdef"))
                expect(node).to.not.be.null
                expect(node.ruleName).to.equal('foo')
            });
            it('"abc" should not match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("abc"))
                expect(node).to.be.null
            });
            it('"xyz" should not match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("xyz"))
                expect(node).to.be.null
            });
            it('"def" should not match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("def"))
                expect(node).to.be.null
            });
        });
    });
});