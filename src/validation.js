"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseErrors = exports.validate = void 0;
const ajv_1 = __importDefault(require("ajv"));
const ajv_formats_1 = __importDefault(require("ajv-formats"));
const ajv = new ajv_1.default({ strict: false });
(0, ajv_formats_1.default)(ajv);
function validate(value, schemaString) {
    const schema = JSON.parse(schemaString);
    if (value === null || value === undefined || value === '') {
        return undefined;
    }
    const result = ajv.validate(schema, value);
    if (result) {
        return undefined;
    }
    if (ajv.errors) {
        return ajv.errors;
    }
    throw new Error('Unexpected data received.');
}
exports.validate = validate;
function parseErrors(errors, label) {
    return errors
        ?.map(e => `${label ?? getInstanceName(e)} ${e.message}`)
        .join('\n');
}
exports.parseErrors = parseErrors;
function getInstanceName(error) {
    return error.instancePath
        .split('/')
        .filter(i => i.trim())
        .join(' ');
}
