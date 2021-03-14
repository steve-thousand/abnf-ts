import { expect } from 'chai';
import { parseRules } from '../src/parser'
import { StringStream } from '../src/reader'
import { SyntaxNode } from '../src/ast'


describe('AST tests', function () {

    describe('Literal concatenation', function () {
        const rules = parseRules(
            `murmur = foo bar foo
            foo = "foo"
            bar = "bar"`
        )

        const murmur = rules[0]
        const foo = rules[1]
        const bar = rules[2]

        it('"foo" should match foo', function () {
            const node: SyntaxNode = foo.consume(new StringStream("foo"))
            expect(node).to.not.be.null
            expect(node.ruleName).to.equal('foo')
        });

        it('"fo" should not match foo', function () {
            const node: SyntaxNode = foo.consume(new StringStream("fo"))
            expect(node).to.be.null
        });

        it('"bar" should not match foo', function () {
            const node: SyntaxNode = foo.consume(new StringStream("bar"))
            expect(node).to.be.null
        });

        it('"bar" should match bar', function () {
            const node: SyntaxNode = bar.consume(new StringStream("bar"))
            expect(node).to.not.be.null
            expect(node.ruleName).to.equal('bar')
        });

        it('"ba" should not match bar', function () {
            const node: SyntaxNode = bar.consume(new StringStream("ba"))
            expect(node).to.be.null
        });

        it('"foo" should not match bar', function () {
            const node: SyntaxNode = bar.consume(new StringStream("foo"))
            expect(node).to.be.null
        });

        it('"foobarfoo" should match murmur', function () {
            const node: SyntaxNode = murmur.consume(new StringStream("foobarfoo"))
            expect(node).to.not.be.null
            expect(node.ruleName).to.equal('murmur')

            expect(node.children.length).to.equal(3)
            expect(node.children[0].ruleName).to.equal('foo')
            expect(node.children[1].ruleName).to.equal('bar')
            expect(node.children[2].ruleName).to.equal('foo')
        });
    })
});