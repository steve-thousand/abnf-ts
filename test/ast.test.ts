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

            const murmur = rules.get('murmur')
            const foo = rules.get('foo')
            const bar = rules.get('bar')

            it('"foo" should match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("foo"), rules)
                expect(node).to.not.be.null
                expect(node.ruleName).to.equal('foo')
            });

            it('"fo" should not match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("fo"), rules)
                expect(node).to.be.null
            });

            it('"bar" should not match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("bar"), rules)
                expect(node).to.be.null
            });

            it('"bar" should match bar', function () {
                const node: RuleSyntaxNode = bar.consume(new StringStream("bar"), rules)
                expect(node).to.not.be.null
                expect(node.ruleName).to.equal('bar')
            });

            it('"ba" should not match bar', function () {
                const node: RuleSyntaxNode = bar.consume(new StringStream("ba"), rules)
                expect(node).to.be.null
            });

            it('"foo" should not match bar', function () {
                const node: RuleSyntaxNode = bar.consume(new StringStream("foo"), rules)
                expect(node).to.be.null
            });

            it('"foobarfoo" should match murmur', function () {
                const node: RuleSyntaxNode = murmur.consume(new StringStream("foobarfoo"), rules)
                expect(node).to.not.be.null
                expect(node.ruleName).to.equal('murmur')

                expect(node.children.length).to.equal(3)
                expect((<RuleSyntaxNode>node.children[0]).ruleName).to.equal('foo')
                expect((<RuleSyntaxNode>node.children[1]).ruleName).to.equal('bar')
                expect((<RuleSyntaxNode>node.children[2]).ruleName).to.equal('foo')
            });
        })
    })

    describe('Value range', function () {
        describe('foo = %b1100010', function () {
            const rules = parseRules('foo = %b1100010')
            const foo = rules.get('foo')
            it('"a" should not match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("a"), rules)
                expect(node).to.be.null
            });
            it('"b" should match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("b"), rules)
                expect(node).to.not.be.null
                expect(node.ruleName).to.equal('foo')
            });
            it('"c" should not match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("c"), rules)
                expect(node).to.be.null
            });
        })
        describe('foo = %b1100010-1100100', function () {
            const rules = parseRules('foo = %b1100010-1100100')
            const foo = rules.get('foo')
            it('"a" should not match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("a"), rules)
                expect(node).to.be.null
            });
            it('"b" should match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("b"), rules)
                expect(node).to.not.be.null
                expect(node.ruleName).to.equal('foo')
            });
            it('"c" should match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("c"), rules)
                expect(node).to.not.be.null
                expect(node.ruleName).to.equal('foo')
            });
            it('"d" should match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("d"), rules)
                expect(node).to.not.be.null
                expect(node.ruleName).to.equal('foo')
            });
            it('"e" should not match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("e"), rules)
                expect(node).to.be.null
            });
        })
        describe('foo = %d98', function () {
            const rules = parseRules('foo = %d98')
            const foo = rules.get('foo')
            it('"a" should not match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("a"), rules)
                expect(node).to.be.null
            });
            it('"b" should match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("b"), rules)
                expect(node).to.not.be.null
                expect(node.ruleName).to.equal('foo')
            });
            it('"c" should not match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("c"), rules)
                expect(node).to.be.null
            });
        })
        describe('foo = %d98-100', function () {
            const rules = parseRules('foo = %d98-100')
            const foo = rules.get('foo')
            it('"a" should not match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("a"), rules)
                expect(node).to.be.null
            });
            it('"b" should match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("b"), rules)
                expect(node).to.not.be.null
                expect(node.ruleName).to.equal('foo')
            });
            it('"c" should match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("c"), rules)
                expect(node).to.not.be.null
                expect(node.ruleName).to.equal('foo')
            });
            it('"d" should match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("d"), rules)
                expect(node).to.not.be.null
                expect(node.ruleName).to.equal('foo')
            });
            it('"e" should not match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("e"), rules)
                expect(node).to.be.null
            });
        })
        describe('foo = %x62', function () {
            const rules = parseRules('foo = %x62')
            const foo = rules.get('foo')
            it('"a" should not match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("a"), rules)
                expect(node).to.be.null
            });
            it('"b" should match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("b"), rules)
                expect(node).to.not.be.null
                expect(node.ruleName).to.equal('foo')
            });
            it('"c" should not match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("c"), rules)
                expect(node).to.be.null
            });
        })
        describe('foo = %x62-64', function () {
            const rules = parseRules('foo = %x62-64')
            const foo = rules.get('foo')
            it('"a" should not match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("a"), rules)
                expect(node).to.be.null
            });
            it('"b" should match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("b"), rules)
                expect(node).to.not.be.null
                expect(node.ruleName).to.equal('foo')
            });
            it('"c" should match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("c"), rules)
                expect(node).to.not.be.null
                expect(node.ruleName).to.equal('foo')
            });
            it('"d" should match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("d"), rules)
                expect(node).to.not.be.null
                expect(node.ruleName).to.equal('foo')
            });
            it('"e" should not match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("e"), rules)
                expect(node).to.be.null
            });
        })
    })

    describe('Repetition', function () {
        describe('foo = 2*4"abc"', function () {
            const rules = parseRules('foo = 2*4"abc"')
            const foo = rules.get('foo')

            it('"abc" should not match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("abc"), rules)
                expect(node).to.be.null
            });
            it('"abcabc" should match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("abcabc"), rules)
                expect(node).to.not.be.null
                expect(node.ruleName).to.equal('foo')
            });
            it('"abcabcabc" should match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("abcabcabc"), rules)
                expect(node).to.not.be.null
                expect(node.ruleName).to.equal('foo')
            });
            it('"abcabcabcabc" should match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("abcabcabcabc"), rules)
                expect(node).to.not.be.null
                expect(node.ruleName).to.equal('foo')
            });
            it('"abcabcabcabcabc" should not match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("abcabcabcabcabc"), rules)
                expect(node).to.be.null
            });
        });
        describe('foo = 0*1"abc"', function () {
            const rules = parseRules('foo = 0*1"abc"')
            const foo = rules.get('foo')

            it('"" should match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream(""), rules)
                expect(node).to.not.be.null
                expect(node.ruleName).to.equal('foo')
            });
            it('"abc" should match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("abc"), rules)
                expect(node).to.not.be.null
                expect(node.ruleName).to.equal('foo')
            });
            it('"abcabc" should not match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("abcabc"), rules)
                expect(node).to.be.null
            });
        });
        describe('foo = *1"abc"', function () {
            const rules = parseRules('foo = *1"abc"')
            const foo = rules.get('foo')

            it('"" should match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream(""), rules)
                expect(node).to.not.be.null
                expect(node.ruleName).to.equal('foo')
            });
            it('"abc" should match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("abc"), rules)
                expect(node).to.not.be.null
                expect(node.ruleName).to.equal('foo')
            });
            it('"abcabc" should not match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("abcabc"), rules)
                expect(node).to.be.null
            });
        });
        describe('foo = *"abc"', function () {
            const rules = parseRules('foo = *"abc"')
            const foo = rules.get('foo')

            it('"" should match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream(""), rules)
                expect(node).to.not.be.null
                expect(node.ruleName).to.equal('foo')
            });
            it('"abc" should match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("abc"), rules)
                expect(node).to.not.be.null
                expect(node.ruleName).to.equal('foo')
            });
            it('"abcabc" should match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("abcabc"), rules)
                expect(node).to.not.be.null
                expect(node.ruleName).to.equal('foo')
            });
            it('"abcabcabcabcabcabcabcabc" should match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("abcabcabcabcabcabcabcabc"), rules)
                expect(node).to.not.be.null
                expect(node.ruleName).to.equal('foo')
            });
        });
    })

    describe('Alternation', function () {
        describe('foo = "abc" / "xyz" "123" / "def"', function () {
            const rules = parseRules('foo = "abc" / "xyz" "123" / "def"')
            const foo = rules.get('foo')

            it('"abc" should match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("abc"), rules)
                expect(node).to.not.be.null
                expect(node.ruleName).to.equal('foo')
            });
            it('"xyz123" should match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("xyz123"), rules)
                expect(node).to.not.be.null
                expect(node.ruleName).to.equal('foo')
            });
            it('"xyz" should not match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("xyz"), rules)
                expect(node).to.be.null
            });
            it('"def" should match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("def"), rules)
                expect(node).to.not.be.null
                expect(node.ruleName).to.equal('foo')
            });
        });
    });

    describe('Optional group', function () {
        describe('foo = "abc" ["xyz"] "def"', function () {
            const rules = parseRules('foo = "abc" ["xyz"] "def"')
            const foo = rules.get('foo')

            it('"abcdef" should match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("abcdef"), rules)
                expect(node).to.not.be.null
                expect(node.ruleName).to.equal('foo')
            });
            it('"abcxyzdef" should match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("abcxyzdef"), rules)
                expect(node).to.not.be.null
                expect(node.ruleName).to.equal('foo')
            });
            it('"abc" should not match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("abc"), rules)
                expect(node).to.be.null
            });
            it('"xyz" should not match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("xyz"), rules)
                expect(node).to.be.null
            });
            it('"def" should not match foo', function () {
                const node: RuleSyntaxNode = foo.consume(new StringStream("def"), rules)
                expect(node).to.be.null
            });
        });
    });
});