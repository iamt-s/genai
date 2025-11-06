// ...existing code...
import { readLocalSchema, readSchemaFromRepo, cloneOrPull } from './fetchSchema';
import { summarizeSchema, diffSchemas } from './parseAndDiff';
import { analyzeWithLLM } from './analyzeAndGenerate';
import { writeReport,writeDiff, writeGeneratedTests } from './writeOutputs';
import fs from 'fs';
import {extractAndWriteTests} from "./extractCode";

async function writeDebug(name: string, data: any) {
  await fs.promises.mkdir('reports', { recursive: true });
  const path = `reports/debug-${name}.json`;
  await fs.promises.writeFile(path, typeof data === 'string' ? data : JSON.stringify(data, null, 2), 'utf8');
  console.log(`✅ Wrote debug file: ${path}`);
}

async function main() {
  const repoUrl = process.env.SCHEMA_REPO_URL;
  const repoLocalPath = 'schemas';
  let latestSchemaStr: string;
  const baselinePath = './schemas/baseline-schema.graphql';

  if (repoUrl) {
    console.log('Cloning or pulling repo...');
    await cloneOrPull(repoUrl, repoLocalPath);
    latestSchemaStr = await readSchemaFromRepo(repoLocalPath, process.env.SCHEMA_PATH || './latest-schema.graphql');
  } else {
    latestSchemaStr = await readLocalSchema('./schemas/latest-schema.graphql');
  }

  const baselineSchema = (await fs.promises.readFile(baselinePath, 'utf8'));

  // Write raw schemas for debugging
  await writeDebug('raw-baseline', baselineSchema);
  await writeDebug('raw-latest', latestSchemaStr);

  const baseSummary = summarizeSchema(baselineSchema);
  const latestSummary = summarizeSchema(latestSchemaStr);

  // Write parsed summaries for debugging
  await writeDebug('summary-baseline', baseSummary);
  await writeDebug('summary-latest', latestSummary);

  // Log quick counts to console
  console.log(`Types in baseline: ${Object.keys(baseSummary.types).length}`);
  console.log(`Types in latest:   ${Object.keys(latestSummary.types).length}`);

  const diff = diffSchemas(baseSummary, latestSummary);

  // Write the machine-diff for inspection
  await writeDebug('machine-diff', diff);

  await writeReport('Machine diff JSON (see JSON file)', diff, 'reports');

  console.log('Calling LLM to analyze diffs and generate tests...');
  const result = await analyzeWithLLM(baseSummary, latestSummary, diff);

  await writeDiff(result.report_text, result, "reports");
  await extractAndWriteTests(result, "reports");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});