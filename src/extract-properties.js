"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extract = exports.extractProperties = void 0;
const parse_refs_1 = require("./parse-refs");
const ts_morph_1 = require("ts-morph");
const extractProperties = (schema, baseSchema, sourceFile) => {
    Object.entries(schema).forEach(([key, value]) => {
        const classDeclaration = sourceFile.addClass({ name: key, isExported: true });
        Object.entries(value).forEach(([k, v]) => {
            const tempClass = sourceFile.addClass({});
            const property = classDeclaration.addProperty({
                name: k,
                isStatic: true,
                initializer: tempClass.getText()
            });
            tempClass.remove();
            const innerClass = property.getInitializerOrThrow().asKindOrThrow(ts_morph_1.SyntaxKind.ClassExpression);
            (0, exports.extract)(v, baseSchema, innerClass, sourceFile);
        });
    });
};
exports.extractProperties = extractProperties;
const extract = (schema, baseSchema, clazz, sourceFile) => {
    if (!hasSchema(schema)) {
        Object.entries(schema).forEach(([key, value]) => {
            if (typeof value !== 'object' || Array.isArray(value)) {
                return;
            }
            const tempClass = sourceFile.addClass({});
            const name = value.$ref ? convertRefToImport(value.$ref) : undefined;
            const property = clazz.addProperty({
                name: key,
                isStatic: true,
                initializer: name || tempClass.getText()
            });
            tempClass.remove();
            const initializer = property.getInitializerIfKind(ts_morph_1.SyntaxKind.ClassExpression);
            if (initializer) {
                const innerClass = initializer.asKindOrThrow(ts_morph_1.SyntaxKind.ClassExpression);
                (0, exports.extract)(value, baseSchema, innerClass, sourceFile);
            }
        });
    }
    else {
        const properties = check(schema);
        clazz.addProperty({
            name: '__schema__',
            isStatic: true,
            initializer: `'${JSON.stringify((0, parse_refs_1.parseRefsWithBase)(schema, baseSchema))}'`
        });
        if (schema.type === 'array' && schema.items) {
            clazz.addProperty({
                name: '__itemsSchema__',
                isStatic: true,
                initializer: `'${JSON.stringify((0, parse_refs_1.parseRefsWithBase)(schema.items, baseSchema))}'`
            });
        }
        Object.entries(properties).forEach(([key, value]) => {
            const tempClass = sourceFile.addClass({});
            const name = value.$ref ? convertRefToImport(value.$ref) : undefined;
            const property = clazz.addProperty({
                name: key,
                isStatic: true,
                initializer: name || tempClass.getText()
            });
            tempClass.remove();
            const initializer = property.getInitializerIfKind(ts_morph_1.SyntaxKind.ClassExpression);
            if (initializer) {
                const innerClass = initializer.asKindOrThrow(ts_morph_1.SyntaxKind.ClassExpression);
                (0, exports.extract)(value, baseSchema, innerClass, sourceFile);
            }
        });
    }
};
exports.extract = extract;
const check = (schema) => {
    if (schema.type === 'object' && schema.properties) {
        return schema.properties;
    }
    if (schema.type === 'array' && schema.items && schema.items.properties) {
        return schema.items.properties;
    }
    if (schema.allOf) {
        return resolveSpecialProperty(schema.allOf);
    }
    if (schema.anyOf) {
        return resolveSpecialProperty(schema.anyOf);
    }
    if (schema.oneOf) {
        return resolveSpecialProperty(schema.oneOf);
    }
    return {};
};
const hasSchema = (schema) => {
    return !!(schema.type
        || schema.$ref
        || schema.allOf
        || schema.anyOf
        || schema.oneOf);
};
const convertRefToImport = (ref) => {
    const steps = ref.split('/');
    if (steps.length > 2) {
        steps.slice(2).join('.');
        return steps.slice(2).join('.');
    }
    throw new Error(`Unsupported $ref (${ref}) found!`);
};
const getRefName = (ref) => {
    const steps = ref.split('/');
    if (steps.length) {
        return steps[steps.length - 1];
    }
    throw new Error(`Unsupported $ref (${ref}) found!`);
};
const resolveSpecialProperty = (entries) => {
    return entries.reduce((o, e, i) => {
        const refName = e.$ref ? getRefName(e.$ref) : undefined;
        const name = refName || `Entry${i + 1}`;
        return {
            ...o,
            [name]: e
        };
    }, {});
};
