import { SchemaSummary } from './parseAndDiff';
import { askLLM } from './llmClient';
import prettier from "prettier";
import {callLLM} from "./callLLM";

export async function analyzeWithLLM(base: SchemaSummary, latest: SchemaSummary, diff: any) {
  const payload = {
    summary: {
      addedTypes: diff.addedTypes.map((t: any) => ({ name: t.name, kind: t.kind })),
      removedTypes: diff.removedTypes.map((t: any) => ({ name: t.name, kind: t.kind })),
      changedTypes: diff.changedTypes.map((c: any) => ({
        typeName: c.typeName,
        changes: c.changes,
      })),
    },
    guidance: "Generate detailed explanation and TypeScript Jest tests with graphql-request.",
  };

  const prompt = `You are a GraphQL expert. Given the following schema diff, classify the changes as breaking or non-breaking. For each change explain briefly why. also fomrat the output in markdown format with appropriate headings.
Also provide the details hirarchy of that change in the schema.
Please return your answer in this format:

BREAKING CHANGES:
- ...

NON-BREAKING CHANGES:
- ...
Generate tests for this differences. Validate both success and failure, and include edge cases, Also provide sample GET Request for each test case.format your response as a TypeScript code block.
Diff:
${JSON.stringify(payload, null, 2)}
  `;

  const raw = await callLLM(prompt);
  let parsed: any = { report_text: raw, generated_tests: [] };
  try {
    const start = raw.indexOf('{');
    const jsonStr = raw.slice(start);
    parsed = JSON.parse(jsonStr);
  } catch (e) {
    parsed = { report_text: raw, generated_tests: [] };
  }

  parsed.generated_tests = (parsed.generated_tests || []).map((t: any) => {
    try {
      t.content = prettier.format(t.content, { parser: "typescript" });
    } catch (e) {}
    return t;
  });

  return parsed;
}