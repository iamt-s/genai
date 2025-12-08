import { SchemaSummary } from './parseAndDiff';
import prettier from "prettier";
import {callLLM} from "./callLLM";
import {callLLM2} from "./callLLM2";
import dotenv from "dotenv";
dotenv.config();
const apiEndPoint = process.env.API_ENDPOINT || "http://localhost:4000/graphql";
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
  const template =` query {
            countries(code: "IN") {
                code
                name
                native
                phone
                continent {
                    code
                }
                currency
                languages {
                    code
                }
                emoji
                emojiU
                states{
                    code
                    name
                }
              population  
              languages{ name}
            }
        }`
 const prompt = `You are a GraphQL expert. Given the following schema diff, classify the changes as breaking or non-breaking. For each change explain briefly why. also fomrat the output in markdown format with appropriate headings.
Also provide the details hirarchy of that change in the schema. and also  - Highlight constraint changes (e.g., minLength, maxLength) clearly.
Please return your answer in this format:

BREAKING CHANGES:
- ...

NON-BREAKING CHANGES:
- ...
- Generate tests for this differences. Validate both success and failure, And include edge cases, Also provide sample GET Request with ${apiEndPoint}for each test case.
- Keep all the types mentioned in the ${template} just add or remove fields as per the changes in schema.
- While creating type specific test cases, ensure to include all nonNullable/Mandatory fields of that type as per the latest schema in payloads in tests.
- while need to use countries code to get the response according to the schema.Use actual data instead of variables in the query. like countries {code: "IN"}.
- format your response as a separate TypeScript code block for Each Type and each type should be separate describe block of code.
- For Each Separate typescript code block it should create separate test file.
- Always include one master test case in every generated test file for country, which queries for a country using countries(code: "IN") and 
- requests all possible fields for the Country type as per the latest schema. The master case should validate the full payload and
  ensure all fields are present and correct.
- Description should not be there in .ts file it should be only in markdown report.
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