import {readFileSync} from "fs";
import {join} from 'path';
import {load} from 'js-yaml';
import {FileType, JsonContent} from "./models";
import {extractProperties} from "./extract-properties";
import {Project} from "ts-morph";

const project = new Project({
  skipAddingFilesFromTsConfig: true
});

const getFileType = (filePath: string): FileType => {
  if (filePath.endsWith('.yaml') || filePath.endsWith('.yml')) {
    return 'yaml';
  }
  if (filePath.endsWith('.json')) {
    return 'json';
  }
  throw new Error('input file must end with .json, .yaml or .yml');
}

const parseFile = (filePath: string, fileType: FileType): JsonContent => {
  const fullPath = join(process.cwd(), filePath);
  const content = readFileSync(fullPath, 'utf-8');
  if (fileType === 'yaml') {
    return load(content) as any;
  }
  return JSON.parse(content);
}

export const generate = (input: string, output: string) => {
  const type = getFileType(input);
  const content = parseFile(input, type);
  const sourceFile = project.createSourceFile(join(process.cwd(), output, 'schema.ts'), '', {overwrite: true});

  const filtered = Object.entries(content.components).reduce((acc: any, [key, value]) => {
    if (['schemas', 'parameters'].includes(key)) {
      return {...acc, [key]: value};
    }
    if (['requestBodies'].includes(key)) {
      return {...acc, [key]: parseRequestBodies(value as JsonContent)};
    }
    return acc;
  }, {});

  extractProperties(filtered, content, sourceFile);

  sourceFile.saveSync();
}

const parseRequestBodies = (requestBodies: JsonContent) => {
  return Object.entries(requestBodies).reduce((acc: any, [key, value]) => {
    const body = parseRequestBody(value.content);
    return {...acc, [key]: {...body}};
  }, {});
}

const parseRequestBody = (requestBody: JsonContent) => {
  return Object.entries(requestBody).reduce((acc: any, [key, value]) => {
    return {...acc, [toValidPropertyName(key)]: {...value.schema}};
  }, {});
}

const toValidPropertyName = (name: string) => {
  const valid = name.replace(/[^a-zA-Z\d$_]/, '_');
  if (/^\d.*/.test(valid)) {
    return `_${valid}`;
  }
  return valid;
}
