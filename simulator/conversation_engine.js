import OpenAI from 'openai';
import utils from '../common/utils.js';

const openai = new OpenAI(process.env.OPENAI_API_KEY);

class ConversationEngine {
    constructor(scenario, model) {
        this.scenario = scenario;
        this.model = model;
        this.memory = '';
    }

    async generate(query, answer) {
        this.memory += `Human: ${query}\n`;
        const systemMessage = this.scenario.systemMessage;
        const userMessage = utils.fillTemplate(this.scenario.userMessage, { memory: this.memory, answer: answer });
        const messages = [
            { role: "system", content: systemMessage },
            { role: "user", content: userMessage },
        ];

        var response;
        try {
            response = await openai.chat.completions.create({
                model: this.model,
                messages: messages
            });
        } catch (error) {
            throw new Error("Converation Generator ERROR:" + error);
        }

        // Extract the 'question' from the OpenAI response
        const result = response.choices[0].message.content.trim();
        this.memory += `Chatbot: ${answer}\n`;

        let question = '';
        try {
            question = JSON.parse(result).question;
        } catch (error) {
            question = result;
        }

        return question;
    }
}

export default ConversationEngine;
