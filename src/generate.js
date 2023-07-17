"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const js_yaml_1 = require("js-yaml");
const extract_properties_1 = require("./extract-properties");
const ts_morph_1 = require("ts-morph");
const project = new ts_morph_1.Project({
    skipAddingFilesFromTsConfig: true
});
const getFileType = (filePath) => {
    if (filePath.endsWith('.yaml') || filePath.endsWith('.yml')) {
        return 'yaml';
    }
    if (filePath.endsWith('.json')) {
        return 'json';
    }
    throw new Error('input file must end with .json, .yaml or .yml');
};
const parseFile = (filePath, fileType) => {
    const fullPath = (0, path_1.join)(process.cwd(), filePath);
    const content = (0, fs_1.readFileSync)(fullPath, 'utf-8');
    if (fileType === 'yaml') {
        return (0, js_yaml_1.load)(content);
    }
    return JSON.parse(content);
};
const generate = (input, output) => {
    const type = getFileType(input);
    const content = parseFile(input, type);
    const sourceFile = project.createSourceFile((0, path_1.join)(process.cwd(), output, 'schema.ts'), '', { overwrite: true });
    const filtered = Object.entries(content.components).reduce((acc, [key, value]) => {
        if (['schemas', 'parameters'].includes(key)) {
            return { ...acc, [key]: value };
        }
        if (['requestBodies'].includes(key)) {
            return { ...acc, [key]: parseRequestBodies(value) };
        }
        return acc;
    }, {});
    (0, extract_properties_1.extractProperties)(filtered, content, sourceFile);
    sourceFile.saveSync();
};
exports.generate = generate;
const parseRequestBodies = (requestBodies) => {
    return Object.entries(requestBodies).reduce((acc, [key, value]) => {
        const body = parseRequestBody(value.content);
        return { ...acc, [key]: { ...body } };
    }, {});
};
const parseRequestBody = (requestBody) => {
    return Object.entries(requestBody).reduce((acc, [key, value]) => {
        return { ...acc, [toValidPropertyName(key)]: { ...value.schema } };
    }, {});
};
const toValidPropertyName = (name) => {
    const valid = name.replace(/[^a-zA-Z\d$_]/, '_');
    if (/^\d.*/.test(valid)) {
        return `_${valid}`;
    }
    return valid;
};
