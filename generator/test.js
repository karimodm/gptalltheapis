import fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import utils from '../common/utils.js';
import Generator from './generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
    const apiClient = await new Generator(
        fs.readFileSync(__dirname + '/data/client_generator_prompt_neut.txt', 'utf-8'),
        () => "Use the following OpenAPI spec:\n" + fs.readFileSync(__dirname + '/data/uber.json', 'utf-8')
    ).generate();

    fs.writeFileSync(__dirname + '/results/apiclient.js', utils.extractCodeBlock(apiClient))

    const functions = await new Generator(
        fs.readFileSync(__dirname + '/data/functions_generator_prompt.txt', 'utf-8'),
        () => "Use the following NodeJS class to generate 'functions':\n" + fs.readFileSync(__dirname + '/results/apiclient.js', 'utf-8')
    ).generate();

    fs.writeFileSync(__dirname + '/results/functions.json', utils.extractCodeBlock(functions))

    const context = await new Generator(
        fs.readFileSync(__dirname + '/data/context_generator_prompt.txt', 'utf-8'),
        () => "Use the following OpenAPI spec:\n" + fs.readFileSync(__dirname + '/data/uber.json', 'utf-8')
    ).generate();

    fs.writeFileSync(__dirname + '/results/safety_context.txt', context)
}

main();