#! /usr/bin/env node

import {program} from "commander";
import {generate} from "../src/generate";

interface Options {
  input: string;
  output: string;
}

program
  .name('openapi-ts-validator')
  .command('generate')
  .description('Generate TypeScript classes from OpenAPI files')
  .requiredOption('-i, --input <input>', 'target input file (yaml or json)', '.')
  .requiredOption('-o, --output <output>', 'target output directory', '.')
  .action((options: Options) => generate(options.input, options.output))

program.parse();
