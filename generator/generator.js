import OpenAI from 'openai';

const openai = new OpenAI(process.env.OPENAI_API_KEY);

class Generator {
    constructor(prompt, getMessageCallback, model = "gpt-4-1106-preview") {
        this.getMessageCallback = getMessageCallback;
        this.assistant = openai.beta.assistants.create({
            instructions: prompt,
            model: model,
        });
    }

    async generate() {
        // Create a thread
        const thread = await openai.beta.threads.create();

        // Add a message to the thread
        await openai.beta.threads.messages.create(
            thread.id,
            {
                role: "user",
                content: this.getMessageCallback()
            }
        );

        this.assistant = await this.assistant;

        // Run the thread against the assistant
        var run = await openai.beta.threads.runs.create(
            thread.id,
            {
                assistant_id: this.assistant.id,
            }
        );

        while (run.status !== "completed") {
            run = await openai.beta.threads.runs.retrieve(
                thread.id,
                run.id
            );

            if (run.status === "in_progress" || run.status === "queued") {
                // Don't query too fast.
                await new Promise(resolve => setTimeout(resolve, 1000));
                continue;
            }

            if (run.status !== "completed") {
                // We don't support other states atm.
                throw new Error(`Unexpected run status: ${run.status}: ${JSON.stringify(run)}`);
            }
        }

        const messages = await openai.beta.threads.messages.list(
            thread.id
        );

        return messages.data[0].content[0].text.value;
    }
}

export default Generator;