"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeWithLLM = analyzeWithLLM;
const llmClient_1 = require("./llmClient");
const prettier_1 = __importDefault(require("prettier"));
async function analyzeWithLLM(base, latest, diff) {
    const payload = {
        summary: {
            addedTypes: diff.addedTypes.map((t) => ({ name: t.name, kind: t.kind })),
            removedTypes: diff.removedTypes.map((t) => ({ name: t.name, kind: t.kind })),
            changedTypes: diff.changedTypes.map((c) => ({
                typeName: c.typeName,
                changes: c.changes,
            })),
        },
        guidance: "Generate detailed explanation and TypeScript Jest tests with graphql-request.",
    };
    const prompt = `You are a GraphQL QA assistant. Given the diff JSON below, produce:
1) Human-readable report of schema changes (with impact).
2) Jest test files in TypeScript (graphql-request).

Return JSON with keys report_text and generated_tests.

Diff:
${JSON.stringify(payload, null, 2)}
  `;
    const raw = await (0, llmClient_1.askLLM)(prompt, 1200);
    let parsed = { report_text: raw, generated_tests: [] };
    try {
        const start = raw.indexOf('{');
        const jsonStr = raw.slice(start);
        parsed = JSON.parse(jsonStr);
    }
    catch (e) {
        parsed = { report_text: raw, generated_tests: [] };
    }
    parsed.generated_tests = (parsed.generated_tests || []).map((t) => {
        try {
            t.content = prettier_1.default.format(t.content, { parser: "typescript" });
        }
        catch (e) { }
        return t;
    });
    return parsed;
}
