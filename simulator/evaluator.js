import OpenAI from 'openai';
import utils from '../common/utils.js';

const openai = new OpenAI(process.env.OPENAI_API_KEY);

class Evaluator {
    constructor(scenario, model) {
        this.scenario = scenario;
        this.model = model;
        this.examples = scenario.examples.map(example => `Query: "${example.query}", Answer: "${example.answer}", Eval Function: "${example.evalFunction}", Eval Result: "${example.evalResult}", Eval Reason: "${example.evalReason}"`).join('\n\n');
    }

    async evaluate(answer) {
        const userMessage = utils.fillTemplate(this.scenario.userMessage, { answer: answer, examples: this.examples });
        const systemMessage = this.scenario.systemMessage;
        const messages = [
            { role: "system", content: systemMessage },
            { role: "user", content: userMessage },
        ];

        let response = ''
        try {
            response = await openai.chat.completions.create({
                model: this.model,
                messages: messages
            });
        } catch (error) {
            throw new Error("Evaluator ERROR: " + error);
        }

        // Extract the evaluation result from the OpenAI response
        const res = response.choices[0].message.content.trim()

        var metricResult
        var explanation
        try {
            const evaluation = JSON.parse(res);
            metricResult = evaluation.verdict.includes("No") ? false : true;
            explanation = evaluation.explanation;
        } catch (error) {
            metricResult = res.includes("No") ? false : true;
            explanation = res
        }

        return [metricResult, explanation];
    }

}

export default Evaluator;
