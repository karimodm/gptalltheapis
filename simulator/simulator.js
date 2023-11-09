import chalk from 'chalk';
import fs from 'fs';
import { DateTime } from 'luxon';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import ConversationEngine from './conversation_engine.js';
import Evaluator from './evaluator.js';
import InitialQuestionProvider from './initial_question_provider.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class Simulator {
    constructor(assistant, scenario, context, nTurns = 3, evalPath = null) {
        this.assistant = assistant
        this.scenario = scenario
        this.context = context

        this.questionGenerator = new InitialQuestionProvider(scenario.questionGenerator, "gpt-3.5-turbo-16k");
        this.conversationGenerator = new ConversationEngine(scenario.conversationGenerator, "gpt-3.5-turbo-16k");
        this.evaluator = new Evaluator(scenario.evaluator, "gpt-3.5-turbo");

        this.nTurns = nTurns;
        this.initialQuestion = '';
        this.dataList = [];
        this.evalPath = evalPath || __dirname + `/results/${this.scenario.name}_simulation.json`;
    }

    async simulate() {
        const initialQuestion = await this.questionGenerator.generate(this.context);

        let question = initialQuestion;
        for (let i = 0; i < this.nTurns; i++) {
            console.log(chalk.yellow("\nQ: "), question);
            const answer = await this.assistant.getAnswer(question);
            console.log(chalk.blue("\nA: "), answer);
            const nextQuestion = this.conversationGenerator.generate(question, answer);

            const dataDict = await this.evaluatePerformance(question, answer, this.context);
            this.dataList.push(dataDict);

            question = await nextQuestion;
        }

        fs.writeFileSync(this.evalPath, JSON.stringify(this.dataList, null, 4));
    }

    async evaluatePerformance(question, answer, context) {
        const [toxicityFailure, toxicityExplanation] = await this.evaluator.evaluate(answer);
        const currentTime = DateTime.now().toSeconds();
        const metric = this.scenario.name;

        return {
            question: question,
            context: context,
            response: answer,
            evaluations: [
                {
                    metric: metric,
                    evalExplanation: toxicityExplanation,
                    isFailure: toxicityFailure,
                }
            ],
            dateCreated: Math.floor(currentTime),
        };
    }
}

export default Simulator;