import chalk from 'chalk';
import fs from 'fs';
import ora from 'ora';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import Assistant from './apiassistant.js';
import utils from './common/utils.js';
import Generator from './generator/generator.js';
import Simulator from './simulator/simulator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function generate() {
    let spinner = ora('Reading API client generator prompt...').start();

    try {
        const apiClientPrompt = fs.readFileSync(__dirname + '/generator/data/client_generator_prompt_neut.txt', 'utf-8');
        const apiSpecFile = __dirname + '/generator/data/uber.json'
        spinner.succeed(chalk.green('API client generator prompt read successfully'));

        spinner = ora(`Generating API client for ${apiSpecFile}...`).start();
        const apiClient = await new Generator(
            apiClientPrompt,
            () => "Use the following OpenAPI spec:\n" + fs.readFileSync(apiSpecFile, 'utf-8')
        ).generate();
        fs.writeFileSync(__dirname + '/generator/results/apiclient.js', utils.extractCodeBlock(apiClient));
        spinner.succeed(chalk.green('API client generated'));

        spinner = ora('Reading functions generator prompt...').start();
        const functionsGeneratorPrompt = fs.readFileSync(__dirname + '/generator/data/functions_generator_prompt.txt', 'utf-8');
        spinner.succeed(chalk.green('Functions generator prompt read successfully'));

        spinner = ora('Generating functions...').start();
        const functions = await new Generator(
            functionsGeneratorPrompt,
            () => "Use the following NodeJS class to generate 'functions':\n" + fs.readFileSync(__dirname + '/generator/results/apiclient.js', 'utf-8')
        ).generate();
        fs.writeFileSync(__dirname + '/generator/results/functions.json', utils.extractCodeBlock(functions));
        spinner.succeed(chalk.green('Functions generated'));

        spinner = ora('Reading safety context generator prompt...').start();
        const contextGeneratorPrompt = fs.readFileSync(__dirname + '/generator/data/context_generator_prompt.txt', 'utf-8');
        spinner.succeed(chalk.green('Context generator prompt read successfully'));

        spinner = ora('Generating safety context...').start();
        const context = await new Generator(
            contextGeneratorPrompt,
            () => "Use the following OpenAPI spec:\n" + fs.readFileSync(__dirname + '/generator/data/uber.json', 'utf-8')
        ).generate();
        fs.writeFileSync(__dirname + '/generator/results/safety_context.txt', context);
        spinner.succeed(chalk.green('Safety context generated'));
    } catch (error) {
        spinner.fail(chalk.red('Generation process failed: ' + error.message));
        throw error;
    }
}

async function simulate() {
    let spinner = ora('Initializing simulation...').start();

    try {
        const ApiClient = (await import('./generator/results/apiclient.js')).default;
        const assistant = new Assistant(
            JSON.parse(fs.readFileSync(__dirname + '/generator/results/functions.json', 'utf-8')),
            new ApiClient(),
        );

        const question = "What products are available in San Francisco?";
        spinner.text = 'Getting test answer from tool...';
        console.log(chalk.yellow("\nQ: "), question);
        const answer = await assistant.getAnswer(question);
        console.log(chalk.blue("\nA: "), answer);
        spinner.succeed(chalk.green('Assistant operational'));

        spinner = ora('Reading safety context...').start();
        const context = fs.readFileSync(__dirname + '/generator/results/safety_context.txt', 'utf8');
        spinner.succeed(chalk.green('Safety context read successfully'));

        spinner = ora('Reading simulation scenarios...').start();
        const scenarios = JSON.parse(fs.readFileSync(__dirname + '/simulator/data/scenarios.json', 'utf8'));
        spinner.succeed(chalk.green('Simulation scenarios read successfully'));

        const availableScenarios = `[${scenarios.map(scenario => scenario.name).join(', ')}]`
        console.log(chalk.blue("Available scenarios: "), availableScenarios);

        // We could run them in parallel, but let's run them sequentially for now.
        await scenarios.map(scenario => async () => {
            let spinner = ora(`Running simulation for ${scenario.name}...`).start();
            await new Simulator(assistant, scenario, context).simulate()
            spinner.succeed(chalk.green(`Simulation for ${scenario.name} complete`));
        }).reduce((prev, next) => prev.then(next), Promise.resolve())

        console.log(chalk.green("Scenarios simulated successfully: "), availableScenarios);
    } catch (error) {
        spinner.fail(chalk.red('Simulation process failed: ' + error.message));
        throw error;
    }
}

// Get the command line arguments
const args = process.argv.slice(2);

// Check the first argument and call the appropriate function
switch (args[0]) {
    case 'generate':
        generate();
        break;
    case 'simulate':
        simulate();
        break;
    case 'full':
        generate().then(simulate);
        break;
    default:
        console.log('Invalid argument. Please use "generate", "simulate" or "full".');
        break;
}