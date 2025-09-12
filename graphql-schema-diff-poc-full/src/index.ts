import { readLocalSchema, readSchemaFromRepo, cloneOrPull } from './fetchSchema';
import { summarizeSchema, diffSchemas } from './parseAndDiff';
import { analyzeWithLLM } from './analyzeAndGenerate';
import { writeReport, writeGeneratedTests } from './writeOutputs';
import path from 'path';
import fs from 'fs';
import {extractAndWriteTests} from "./extractCode";

async function main() {
  const repoUrl = process.env.SCHEMA_REPO_URL;
  const repoLocalPath = './tmp-repo';
  let latestSchemaStr: string;
  const baselinePath = './schemas/baseline-schema.graphql';

  if (repoUrl) {
    console.log('Cloning or pulling repo...');
    await cloneOrPull(repoUrl, repoLocalPath);
    latestSchemaStr = await readSchemaFromRepo(repoLocalPath, process.env.SCHEMA_PATH || 'schema.graphql');
  } else {
    latestSchemaStr = await readLocalSchema('./schemas/latest-schema.graphql');
  }

  const baselineSchema = (await fs.promises.readFile(baselinePath, 'utf8'));
  const baseSummary = summarizeSchema(baselineSchema);
  const latestSummary = summarizeSchema(latestSchemaStr);
  const diff = diffSchemas(baseSummary, latestSummary);

  await writeReport('Machine diff JSON (see JSON file)', diff, 'reports');

  console.log('Calling LLM to analyze diffs and generate tests...');
  const result = await analyzeWithLLM(baseSummary, latestSummary, diff);
//   console.log(result);
// Write report (.md + .json)
  await writeReport(result.report_text, result, "reports"); // Writting the Json to reports folder

  await extractAndWriteTests(result, "reports"); // Writting the test cases to generated-tests folder


//   // Write generated Jest test files (.ts)
// if (result.generated_tests && result.generated_tests.length > 0) {
//   await writeGeneratedTests(result.generated_tests, "generated-tests");
//   console.log("✅ Test files written to ./generated-tests");
// } else {
//   console.log("⚠️ No generated tests found in LLM response.");
// }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});