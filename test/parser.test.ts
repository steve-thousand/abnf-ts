import { expect } from 'chai';
import { parseRules } from '../src/parser'
import * as abnf from '../src/abnf';

describe('Parser tests', function () {
    it('Literal', function () {
        const rules: abnf.Rule[] = parseRules('rule = "abc"')
        expect(rules).to.deep.equal([
            new abnf.Rule('rule', [
                new abnf.Literal('abc')
            ])
        ])
    })
    describe('CharRange', function () {
        it('rule = %b10', function () {
            const rules: abnf.Rule[] = parseRules('rule = %b10')
            expect(rules).to.deep.equal([
                new abnf.Rule('rule', [
                    new abnf.CharRange(2, 2)
                ])
            ])
        });
        it('rule = %b10-11', function () {
            const rules: abnf.Rule[] = parseRules('rule = %b10-11')
            expect(rules).to.deep.equal([
                new abnf.Rule('rule', [
                    new abnf.CharRange(2, 3)
                ])
            ])
        });
        it('rule = %d10', function () {
            const rules: abnf.Rule[] = parseRules('rule = %d10')
            expect(rules).to.deep.equal([
                new abnf.Rule('rule', [
                    new abnf.CharRange(10, 10)
                ])
            ])
        });
        it('rule = %d10-12', function () {
            const rules: abnf.Rule[] = parseRules('rule = %d10-12')
            expect(rules).to.deep.equal([
                new abnf.Rule('rule', [
                    new abnf.CharRange(10, 12)
                ])
            ])
        });
        it('rule = %x10', function () {
            const rules: abnf.Rule[] = parseRules('rule = %x10')
            expect(rules).to.deep.equal([
                new abnf.Rule('rule', [
                    new abnf.CharRange(16, 16)
                ])
            ])
        });
        it('rule = %x10-12', function () {
            const rules: abnf.Rule[] = parseRules('rule = %x10-12')
            expect(rules).to.deep.equal([
                new abnf.Rule('rule', [
                    new abnf.CharRange(16, 18)
                ])
            ])
        });
    })
    describe('Sequence rules', function () {
        it('Optional', function () {
            const rules: abnf.Rule[] = parseRules('rule = ["abc"]')
            expect(rules).to.deep.equal([
                new abnf.Rule('rule', [
                    new abnf.Optional([new abnf.Literal('abc')])
                ])
            ])
        })
        it('Group', function () {
            const rules: abnf.Rule[] = parseRules('rule = ("abc")')
            expect(rules).to.deep.equal([
                new abnf.Rule('rule', [
                    new abnf.Group([new abnf.Literal('abc')])
                ])
            ])
        })
    })
    describe('Alternative tests', function () {
        it('Alternative', function () {
            const rules: abnf.Rule[] = parseRules('rule = "abc" / "def"')
            expect(rules).to.deep.equal([
                new abnf.Rule('rule', [
                    new abnf.Alternative([
                        new abnf.Literal('abc'),
                        new abnf.Literal('def')
                    ])
                ])
            ])
        })
        it('Alternative, multiple', function () {
            const rules: abnf.Rule[] = parseRules('rule = "abc" / "def" / "ghi"')
            expect(rules).to.deep.equal([
                new abnf.Rule('rule', [
                    new abnf.Alternative([
                        new abnf.Literal('abc'),
                        new abnf.Literal('def'),
                        new abnf.Literal('ghi')
                    ])
                ])
            ])
        })
        it('Alternative, complex', function () {
            const rules: abnf.Rule[] = parseRules('rule = "abc" / "abc" "def" / "ghi"')
            expect(rules).to.deep.equal([
                new abnf.Rule('rule', [
                    new abnf.Alternative([
                        new abnf.Literal('abc'),
                        new abnf.Group([new abnf.Literal('abc'), new abnf.Literal('def')]),
                        new abnf.Literal('ghi')
                    ])
                ])
            ])
        })
    })
    describe('Repetition tests', function () {
        it('Variable Repetition', function () {
            const rules: abnf.Rule[] = parseRules('rule = 2*5"abc"')
            expect(rules).to.deep.equal([
                new abnf.Rule('rule', [
                    new abnf.Repetition(2, 5, new abnf.Literal('abc'))
                ])
            ])
        })
        it('Variable Repetition - default to 0-5', function () {
            const rules: abnf.Rule[] = parseRules('rule = *5"abc"')
            expect(rules).to.deep.equal([
                new abnf.Rule('rule', [
                    new abnf.Repetition(0, 5, new abnf.Literal('abc'))
                ])
            ])
        })
        it('Variable Repetition - default to 2-Infinity', function () {
            const rules: abnf.Rule[] = parseRules('rule = 2*"abc"')
            expect(rules).to.deep.equal([
                new abnf.Rule('rule', [
                    new abnf.Repetition(2, Infinity, new abnf.Literal('abc'))
                ])
            ])
        })
        it('Variable Repetition - default to 0-Infinity', function () {
            const rules: abnf.Rule[] = parseRules('rule = *"abc"')
            expect(rules).to.deep.equal([
                new abnf.Rule('rule', [
                    new abnf.Repetition(0, Infinity, new abnf.Literal('abc'))
                ])
            ])
        })
        it('Specific Repetition', function () {
            const rules: abnf.Rule[] = parseRules('rule = 5"abc"')
            expect(rules).to.deep.equal([
                new abnf.Rule('rule', [
                    new abnf.Repetition(5, 5, new abnf.Literal('abc'))
                ])
            ])
        })
        it('Group Repetition', function () {
            const rules: abnf.Rule[] = parseRules('rule = 5( "abc" "def" )')
            expect(rules).to.deep.equal([
                new abnf.Rule('rule', [
                    new abnf.Repetition(5, 5, new abnf.Group([
                        new abnf.Literal('abc'),
                        new abnf.Literal('def')
                    ]))
                ])
            ])
        })
    });
    describe('RuleRef tests', function () {
        it('Alpha', function () {
            const rules: abnf.Rule[] = parseRules('rule = foo\nfoo = "abc"')
            expect(rules).to.deep.equal([
                new abnf.Rule('rule', [
                    new abnf.RuleRef(
                        new abnf.Rule('foo', [new abnf.Literal('abc')])
                    )
                ]),
                new abnf.Rule('foo', [
                    new abnf.Literal('abc')
                ])
            ])
        })
        it('Digits', function () {
            const rules: abnf.Rule[] = parseRules('rule = f2o01\nf2o01 = "abc"')
            expect(rules).to.deep.equal([
                new abnf.Rule('rule', [
                    new abnf.RuleRef(
                        new abnf.Rule('f2o01', [new abnf.Literal('abc')])
                    )
                ]),
                new abnf.Rule('f2o01', [
                    new abnf.Literal('abc')
                ])
            ])
        })
        it('Hyphens', function () {
            const rules: abnf.Rule[] = parseRules('rule = foo-2\nfoo-2 = "abc"')
            expect(rules).to.deep.equal([
                new abnf.Rule('rule', [
                    new abnf.RuleRef(
                        new abnf.Rule('foo-2', [new abnf.Literal('abc')])
                    )
                ]),
                new abnf.Rule('foo-2', [
                    new abnf.Literal('abc')
                ])
            ])
        })
    });
    it('Concatenation', function () {
        const rules: abnf.Rule[] = parseRules('rule = "abc" "def"')
        expect(rules).to.deep.equal([
            new abnf.Rule('rule', [
                new abnf.Literal('abc'),
                new abnf.Literal('def')
            ])
        ])
    })
    describe('Comments ignored', function () {
        it('rule = "abc" ; this is a comment', function () {
            const rules: abnf.Rule[] = parseRules('rule = "abc" ; this is a comment')
            expect(rules).to.deep.equal([
                new abnf.Rule('rule', [
                    new abnf.Literal('abc')
                ])
            ])
        })
        it('rule = "abc" ; this is a comment, foo = "def"', function () {
            const rules: abnf.Rule[] = parseRules('rule = "abc" ; this is a comment\nfoo = "def"')
            expect(rules).to.deep.equal([
                new abnf.Rule('rule', [
                    new abnf.Literal('abc')
                ]),
                new abnf.Rule('foo', [
                    new abnf.Literal('def')
                ])
            ])
        })
        it('line that is only a comment', function () {
            const rules: abnf.Rule[] = parseRules('rule = "abc" ; this is a comment\n ; this is also a comment\nfoo = "def"')
            expect(rules).to.deep.equal([
                new abnf.Rule('rule', [
                    new abnf.Literal('abc')
                ]),
                new abnf.Rule('foo', [
                    new abnf.Literal('def')
                ])
            ])
        })
    })
    describe('White space cases', function () {
        it('rule="abc"', function () {
            const rules: abnf.Rule[] = parseRules('rule="abc"')
            expect(rules).to.deep.equal([
                new abnf.Rule('rule', [
                    new abnf.Literal('abc')
                ])
            ])
        })
        it('double spaced', function () {
            const rules: abnf.Rule[] = parseRules('rule="abc"\n\nfoo = "def"')
            expect(rules).to.deep.equal([
                new abnf.Rule('rule', [
                    new abnf.Literal('abc')
                ]),
                new abnf.Rule('foo', [
                    new abnf.Literal('def')
                ])
            ])
        })
    });
})
