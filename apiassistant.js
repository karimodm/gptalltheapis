import OpenAI from 'openai';
import utils from './common/utils.js';

const openai = new OpenAI(process.env.OPENAI_API_KEY);

class APIAssistant {
    constructor(functionsJson, actionProvider, safetyContext, fromId = null) {
        const functions = functionsJson.map((f) => {
            return {
                "type": "function",
                "function": f
            };
        });

        this.actionProvider = actionProvider;

        if (fromId === null) {
            this.assistant = openai.beta.assistants.create({
                instructions: `You are an API gateway. Use the provided functions to answer questions. Use the following context as guidelines for your responses:${safetyContext}}`,
                model: "gpt-4-1106-preview",
                tools: functions,
            });
        } else {
            this.assistant = openai.beta.assistants.retrieve(fromId);
        }
    }

    async fulfillAction(requiredAction) {
        if (requiredAction.type !== "submit_tool_outputs") {
            throw new Error("Unsupported action type: " + requiredAction.type);
        }

        return requiredAction.submit_tool_outputs.tool_calls.map((tool_call) => {
            if (tool_call.type !== "function") {
                throw new Error("Unsupported tool type: " + tool_call.type);
            }

            const toolName = utils.snakeToCamel(tool_call.function.name);
            const toolArgs = tool_call.function.arguments;

            if (!utils.hasMethod(this.actionProvider, toolName)) {
                throw new Error("Unsupported tool: " + toolName);
            }

            const tool = this.actionProvider[toolName];
            const args = JSON.parse(toolArgs);

            return {
                tool_call_id: tool_call.id,
                output: JSON.stringify(tool(...Object.values(args)))
            };
        });
    }

    async getAnswer(question) {
        // Create a thread
        const thread = await openai.beta.threads.create();

        // Add a message to the thread
        await openai.beta.threads.messages.create(
            thread.id,
            {
                role: "user",
                content: question
            }
        );

        this.assistant = await this.assistant

        // Run the thread against the assistant
        var run = await openai.beta.threads.runs.create(
            thread.id,
            {
                assistant_id: this.assistant.id,
                // instructions: "Please address the user as Jane Doe. The user has a premium account."
            }
        );

        while (run.status !== "completed") {
            run = await openai.beta.threads.runs.retrieve(
                thread.id,
                run.id
            )

            if (run.status === "in_progress" || run.status === "queued") {
                await new Promise(resolve => setTimeout(resolve, 1000));
                continue
            }

            if (run.status === "requires_action") {
                const toolOutputs = await this.fulfillAction(run.required_action)

                await openai.beta.threads.runs.submitToolOutputs(
                    thread.id,
                    run.id,
                    {
                        tool_outputs: toolOutputs
                    }
                );

                continue;
            }

            if (run.status !== "completed") {
                throw new Error(`Unexpected run status: ${run.status}: ${JSON.stringify(run)}`);
            }
        }

        const messages = await openai.beta.threads.messages.list(
            thread.id
        );


        return messages.data[0].content[0].text.value
    }
}

export default APIAssistant;