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
                        [new abnf.Literal('abc')],
                        [new abnf.Literal('def')]
                    ])
                ])
            ])
        })
        it('Alternative, multiple', function () {
            const rules: abnf.Rule[] = parseRules('rule = "abc" / "def" / "ghi"')
            expect(rules).to.deep.equal([
                new abnf.Rule('rule', [
                    new abnf.Alternative([
                        [new abnf.Literal('abc')],
                        [new abnf.Literal('def')],
                        [new abnf.Literal('ghi')]
                    ])
                ])
            ])
        })
        it('Alternative, complex', function () {
            const rules: abnf.Rule[] = parseRules('rule = "abc" / "abc" "def" / "ghi"')
            expect(rules).to.deep.equal([
                new abnf.Rule('rule', [
                    new abnf.Alternative([
                        [new abnf.Literal('abc')],
                        [new abnf.Literal('abc'), new abnf.Literal('def')],
                        [new abnf.Literal('ghi')]
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
})

// describe('Multiple rules', function () {
//     it('2 Rules', function () {
//         const rules: abnf.Rule[] = parseRules('rule = foo bar\nfoo="abc"\nbar="def"')
//         expect(rules).to.deep.equal([
//             new abnf.Rule('rule', [
//                 new abnf.RuleRef(
//                     new abnf.Rule("foo", [])
//                 ),
//                 new abnf.RuleRef(
//                     new abnf.Rule("bar", [])
//                 )
//             ]),
//             new abnf.Rule('foo', [
//                 new abnf.Literal('abc')
//             ]),
//             new abnf.Rule('bar', [
//                 new abnf.Literal('def')
//             ])
//         ])
//     })
// });