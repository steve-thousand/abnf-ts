import { expect } from 'chai';
import { parseGrammar } from '../src/parser'
import * as abnf from '../src/abnf';

describe('Parser tests', function () {
    it('Literal', function () {
        const rules: abnf.Rule[] = parseGrammar('rule = "abc"')
        expect(rules.length).to.eq(1)

        const rule = rules[0]
        expect(rule.name).to.equal('rule')

        const ruleElements = rule.elements
        expect(ruleElements.length).to.equal(1)

        const ruleElement = ruleElements[0]
        expect(ruleElement instanceof abnf.Literal).to.be.true
        expect((<abnf.Literal>ruleElement).value).to.equal('abc')
    })
    it('Optional', function () {
        const rules: abnf.Rule[] = parseGrammar('rule = ["abc"]')
        expect(rules.length).to.eq(1)

        const rule = rules[0]
        expect(rule.name).to.equal('rule')

        const ruleElements = rule.elements
        expect(ruleElements.length).to.equal(1)

        const ruleElement = ruleElements[0]
        expect(ruleElement instanceof abnf.Optional).to.be.true

        const sequenceElements = (<abnf.Optional>ruleElement).elements;
        expect(sequenceElements.length).to.equal(1)

        const sequenceElement = sequenceElements[0]
        expect(sequenceElement instanceof abnf.Literal).to.be.true
        expect((<abnf.Literal>sequenceElement).value).to.equal('abc')
    })
    it('Group', function () {
        const rules: abnf.Rule[] = parseGrammar('rule = {"abc"}')
        expect(rules.length).to.eq(1)

        const rule = rules[0]
        expect(rule.name).to.equal('rule')

        const ruleElements = rule.elements
        expect(ruleElements.length).to.equal(1)

        const ruleElement = ruleElements[0]
        expect(ruleElement instanceof abnf.Group).to.be.true

        const sequenceElements = (<abnf.Group>ruleElement).elements;
        expect(sequenceElements.length).to.equal(1)

        const sequenceElement = sequenceElements[0]
        expect(sequenceElement instanceof abnf.Literal).to.be.true
        expect((<abnf.Literal>sequenceElement).value).to.equal('abc')
    })
    describe('Repetition tests', function () {
        it('Variable Repetition', function () {
            const rules: abnf.Rule[] = parseGrammar('rule = 2*5"abc"')
            expect(rules.length).to.eq(1)

            const rule = rules[0]
            expect(rule.name).to.equal('rule')

            const ruleElements = rule.elements
            expect(ruleElements.length).to.equal(1)

            const ruleElement = ruleElements[0]
            expect(ruleElement instanceof abnf.Repetition).to.be.true

            const repetition = <abnf.Repetition>ruleElement
            expect(repetition.atleast).to.equal(2)
            expect(repetition.atMost).to.equal(5)
            expect(repetition.element instanceof abnf.Literal).to.be.true
            expect((<abnf.Literal>repetition.element).value).to.equal('abc')
        })
        it('Variable Repetition - default to 0-5', function () {
            const rules: abnf.Rule[] = parseGrammar('rule = *5"abc"')
            expect(rules.length).to.eq(1)

            const rule = rules[0]
            expect(rule.name).to.equal('rule')

            const ruleElements = rule.elements
            expect(ruleElements.length).to.equal(1)

            const ruleElement = ruleElements[0]
            expect(ruleElement instanceof abnf.Repetition).to.be.true

            const repetition = <abnf.Repetition>ruleElement
            expect(repetition.atleast).to.equal(0)
            expect(repetition.atMost).to.equal(5)
            expect(repetition.element instanceof abnf.Literal).to.be.true
            expect((<abnf.Literal>repetition.element).value).to.equal('abc')
        })
        it('Variable Repetition - default to 2-Infinity', function () {
            const rules: abnf.Rule[] = parseGrammar('rule = 2*"abc"')
            expect(rules.length).to.eq(1)

            const rule = rules[0]
            expect(rule.name).to.equal('rule')

            const ruleElements = rule.elements
            expect(ruleElements.length).to.equal(1)

            const ruleElement = ruleElements[0]
            expect(ruleElement instanceof abnf.Repetition).to.be.true

            const repetition = <abnf.Repetition>ruleElement
            expect(repetition.atleast).to.equal(2)
            expect(repetition.atMost).to.equal(Infinity)
            expect(repetition.element instanceof abnf.Literal).to.be.true
            expect((<abnf.Literal>repetition.element).value).to.equal('abc')
        })
        it('Variable Repetition - default to 0-Infinity', function () {
            const rules: abnf.Rule[] = parseGrammar('rule = *"abc"')
            expect(rules.length).to.eq(1)

            const rule = rules[0]
            expect(rule.name).to.equal('rule')

            const ruleElements = rule.elements
            expect(ruleElements.length).to.equal(1)

            const ruleElement = ruleElements[0]
            expect(ruleElement instanceof abnf.Repetition).to.be.true

            const repetition = <abnf.Repetition>ruleElement
            expect(repetition.atleast).to.equal(0)
            expect(repetition.atMost).to.equal(Infinity)
            expect(repetition.element instanceof abnf.Literal).to.be.true
            expect((<abnf.Literal>repetition.element).value).to.equal('abc')
        })
        it('Specific Repetition', function () {
            const rules: abnf.Rule[] = parseGrammar('rule = 5"abc"')
            expect(rules.length).to.eq(1)

            const rule = rules[0]
            expect(rule.name).to.equal('rule')

            const ruleElements = rule.elements
            expect(ruleElements.length).to.equal(1)

            const ruleElement = ruleElements[0]
            expect(ruleElement instanceof abnf.Repetition).to.be.true

            const repetition = <abnf.Repetition>ruleElement
            expect(repetition.atleast).to.equal(5)
            expect(repetition.atMost).to.equal(5)
            expect(repetition.element instanceof abnf.Literal).to.be.true
            expect((<abnf.Literal>repetition.element).value).to.equal('abc')
        })
    });
})