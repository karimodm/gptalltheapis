import OpenAI from 'openai';
import utils from '../common/utils.js';

const openai = new OpenAI(process.env.OPENAI_API_KEY);

class InitialQuestionProvider {
    constructor(scenario, model) {
        this.scenario = scenario;
        this.model = model;
    }

    async generate(context) {
        const systemMessage = this.scenario.systemMessage;
        const userMessage = utils.fillTemplate(this.scenario.userMessage, { context: context });
        const messages = [
            { role: "system", content: systemMessage },
            { role: "user", content: userMessage },
        ];

        let response = '';
        try {
            response = await openai.chat.completions.create({
                model: this.model,
                messages: messages
            });
        } catch (error) {
            throw new Error("Question Generator ERROR:" + error);
        }

        return response.choices[0].message.content.trim();
    }
}

export default InitialQuestionProvider;