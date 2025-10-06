import { SchemaSummary } from './parseAndDiff';
import prettier from "prettier";
import {callLLM} from "./callLLM";
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
 const prompt = `You are given a GraphQL schema and a list of schema changes.  
Your task has two parts:

---

### Part 1: Schema Diff Analysis
- Given the following schema diff, classify the changes as **breaking** or **non-breaking**.  
- For each change:
  - Explain briefly why it is breaking or non-breaking.  
  - Provide the **hierarchy/path** of the change in the schema (e.g., Query → country → field: name).  
  - Highlight **constraint changes** (e.g., minLength, maxLength, non-nullability, enums).  
- Format the output in **Markdown** using the following structure exactly:


BREAKING CHANGES:
- [Change description]  
  - Reason: ...  
  - Hierarchy: ...  
  - Constraint changes: ...

NON-BREAKING CHANGES:
- [Change description]  
  - Reason: ...  
  - Hierarchy: ...  
  - Constraint changes: ...

---

### Part 2: Test Case Generation
Generate a full suite of Jest test cases in TypeScript.  
The suite must include:
1. Positive test cases for the new or modified fields/queries.  
2. Negative test cases for invalid inputs, missing arguments, or unexpected values.  
3. One mandatory **master test case** (below), which must be included exactly as written, always at the end.

#### ✅ Mandatory Master Test Case (do not change formatting):

    it('should fetch all the types and it's fields successfully', async () => { 
      const graphQLClient = new GraphQLClient(endpoint);

      const query = gql\`
        query ExampleQuery {
          continents {
            code
            name
            countries {
              code
              name
              native
              phone
              capital
              currency
              emoji
              emojiU
            }
          }
          continent(code: "EU") {
            code
            name
            countries {
              code
              name
              native
              phone
              capital
              currency
              emoji
              emojiU
            }
          }
          countries {
            code
            name
            native
            phone
            capital
            currency
            emoji
            emojiU
            continent {
              code
              name
            }
            languages {
              code
              name
              native
              rtl
            }
            states {
              code
              name
            }
          }
          country(code: "IN") {
            code
            name
            native
            phone
            capital
            currency
            emoji
            emojiU
            continent {
              code
              name
            }
            languages {
              code
              name
              native
              rtl
            }
            states {
              code
              name
            }
          }
          languages {
            code
            name
            native
            rtl
          }
          language(code: "en") {
            code
            name
            native
            rtl
          }
        }
      \`;

      const response = await graphQLClient.request(query);
      expect(response).toBeDefined();
    });

---

#### Rules for the master test case:
- Use this exact test name.  
- Always include all root queries and their nested fields one level deep (avoid infinite recursion).
- Do not change the structure or formatting of the master test — only insert the field list from the schema.
- Keep indentation and formatting exactly as shown.

#### Rules for the other test cases:
- Cover both positive and negative scenarios based on the schema changes.
- Follow consistent Jest style: "it('...', async () => { ... })".
- Use "GraphQLClient" for executing queries.
- Keep test descriptions clear and aligned with the schema changes.

#### Final Output:
1. Return **schema diff analysis** first in markdown format.
2. Then return all tests in a single block of TypeScript code.
3. Always include the master test case last.
4. Description should not be there in .ts file, it should be only in markdown report.

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