"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.summarizeSchema = summarizeSchema;
exports.diffSchemas = diffSchemas;
const graphql_1 = require("graphql");
function unwrapType(typeNode) {
    let nonNull = false;
    let isList = false;
    let cur = typeNode;
    while (cur.kind === 'NonNullType' || cur.kind === 'ListType') {
        if (cur.kind === 'NonNullType') {
            nonNull = true;
            cur = cur.type;
        }
        else if (cur.kind === 'ListType') {
            isList = true;
            cur = cur.type;
        }
    }
    return { typeStr: cur.name.value, nonNull, isList };
}
function summarizeSchema(schemaStr) {
    const doc = (0, graphql_1.parse)(schemaStr, { noLocation: true });
    const types = {};
    (0, graphql_1.visit)(doc, {
        enter(node) {
            if (node.kind === 'ObjectTypeDefinition' || node.kind === 'InputObjectTypeDefinition') {
                const kind = node.kind === 'ObjectTypeDefinition' ? 'OBJECT' : 'INPUT_OBJECT';
                const fields = {};
                (node.fields || []).forEach((f) => {
                    const { typeStr, nonNull, isList } = unwrapType(f.type);
                    const args = {};
                    (f.arguments || []).forEach((a) => {
                        const { typeStr: atype } = unwrapType(a.type);
                        args[a.name.value] = atype;
                    });
                    fields[f.name.value] = {
                        name: f.name.value,
                        type: typeStr,
                        nonNull,
                        isList,
                        args,
                        directives: (f.directives || []).map((d) => d.name.value),
                        description: f.description?.value ?? null,
                    };
                });
                types[node.name.value] = {
                    kind,
                    name: node.name.value,
                    fields,
                    description: node.description?.value ?? null,
                    directives: (node.directives || []).map((d) => d.name.value),
                };
            }
            else if (node.kind === 'EnumTypeDefinition') {
                types[node.name.value] = {
                    kind: 'ENUM',
                    name: node.name.value,
                    enumValues: (node.values || []).map((v) => v.name.value),
                    description: node.description?.value ?? null,
                    directives: (node.directives || []).map((d) => d.name.value),
                };
            }
            else if (node.kind === 'ScalarTypeDefinition') {
                types[node.name.value] = {
                    kind: 'SCALAR',
                    name: node.name.value,
                    description: node.description?.value ?? null,
                    directives: (node.directives || []).map((d) => d.name.value),
                };
            }
        }
    });
    return { types };
}
function diffSchemas(base, latest) {
    const result = {
        addedTypes: [],
        removedTypes: [],
        changedTypes: [],
    };
    const baseTypes = Object.keys(base.types);
    const latestTypes = Object.keys(latest.types);
    latestTypes.forEach((t) => {
        if (!base.types[t])
            result.addedTypes.push(latest.types[t]);
    });
    baseTypes.forEach((t) => {
        if (!latest.types[t])
            result.removedTypes.push(base.types[t]);
    });
    latestTypes.forEach((t) => {
        if (base.types[t]) {
            const baseT = base.types[t];
            const latT = latest.types[t];
            const fieldChanges = [];
            const baseFields = baseT.fields ? Object.keys(baseT.fields) : [];
            const latFields = latT.fields ? Object.keys(latT.fields) : [];
            latFields.forEach((f) => {
                if (!baseT.fields || !baseT.fields[f]) {
                    fieldChanges.push({
                        kind: 'FIELD_ADDED',
                        name: f,
                        details: latT.fields[f],
                    });
                }
                else {
                    const b = baseT.fields[f];
                    const l = latT.fields[f];
                    if (b && l) {
                        const diffs = {};
                        if (b.type !== l.type)
                            diffs.typeChanged = { before: b.type, after: l.type };
                        if (b.nonNull !== l.nonNull)
                            diffs.requirednessChanged = { before: b.nonNull, after: l.nonNull };
                        if ((b.isList || false) !== (l.isList || false))
                            diffs.listnessChanged = { before: b.isList, after: l.isList };
                        if (JSON.stringify(b.args) !== JSON.stringify(l.args))
                            diffs.argsChanged = { before: b.args, after: l.args };
                        if (b.description !== l.description)
                            diffs.descriptionChanged = { before: b.description, after: l.description };
                        if (Object.keys(diffs).length) {
                            fieldChanges.push({ kind: 'FIELD_MODIFIED', name: f, diffs, before: b, after: l });
                        }
                    }
                }
            });
            baseFields.forEach((f) => {
                if (!latT.fields || !latT.fields[f]) {
                    fieldChanges.push({
                        kind: 'FIELD_REMOVED',
                        name: f,
                        details: baseT.fields ? baseT.fields[f] : undefined
                    });
                }
            });
            if (fieldChanges.length) {
                result.changedTypes.push({
                    typeName: t,
                    changes: fieldChanges,
                    before: baseT,
                    after: latT,
                });
            }
            else {
                if (baseT.kind === 'ENUM' && latT.kind === 'ENUM') {
                    const added = (latT.enumValues || []).filter((v) => !(baseT.enumValues || []).includes(v));
                    const removed = (baseT.enumValues || []).filter((v) => !(latT.enumValues || []).includes(v));
                    if (added.length || removed.length) {
                        result.changedTypes.push({ typeName: t, enumAdded: added, enumRemoved: removed, before: baseT, after: latT });
                    }
                }
            }
        }
    });
    return result;
}
