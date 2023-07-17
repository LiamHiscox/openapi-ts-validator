#! /usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const generate_1 = require("../src/generate");
commander_1.program
    .name('openapi-ts-validator')
    .command('generate')
    .description('Generate TypeScript classes from OpenAPI files')
    .requiredOption('-i, --input <input>', 'target input file (yaml or json)', '.')
    .requiredOption('-o, --output <output>', 'target output directory', '.')
    .action((options) => (0, generate_1.generate)(options.input, options.output));
commander_1.program.parse();
