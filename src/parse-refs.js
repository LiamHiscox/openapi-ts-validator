"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseRefsWithBase = void 0;
const parseRefsWithBase = (schema, baseSchema) => {
    return check(schema, baseSchema);
};
exports.parseRefsWithBase = parseRefsWithBase;
// recursively check all properties of the given schema and resolve any $refs
// additionally the property $schema is removed as it is not used
const check = (schema, baseSchema) => {
    const newSchema = Object.entries(schema).reduce((acc, [key, entry]) => {
        if (typeof entry === 'object' && !Array.isArray(entry)) {
            return {
                ...acc,
                [key]: check(entry, baseSchema)
            };
        }
        if (Array.isArray(entry)) {
            return {
                ...acc,
                [key]: entry.map(e => typeof e === 'object' ? check(e, baseSchema) : e)
            };
        }
        return {
            ...acc,
            [key]: entry
        };
    }, {});
    if (newSchema.$ref) {
        const resolved = resolveRef(newSchema.$ref, newSchema, baseSchema);
        return check(resolved, baseSchema);
    }
    return newSchema;
};
// resolve $ref and replace i with the value it references
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const resolveRef = (ref, schema, baseSchema) => {
    const keys = ref.substring(2).split('/');
    const value = keys.reduce((acc, cur) => acc[cur], baseSchema);
    delete schema.$ref;
    return { ...schema, ...value };
};
