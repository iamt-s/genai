"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fetchSchema_1 = require("./fetchSchema");
const parseAndDiff_1 = require("./parseAndDiff");
const analyzeAndGenerate_1 = require("./analyzeAndGenerate");
const writeOutputs_1 = require("./writeOutputs");
const fs_1 = __importDefault(require("fs"));
async function main() {
    const repoUrl = process.env.SCHEMA_REPO_URL;
    const repoLocalPath = './tmp-repo';
    let latestSchemaStr;
    const baselinePath = './schemas/baseline-schema.graphql';
    if (repoUrl) {
        console.log('Cloning or pulling repo...');
        await (0, fetchSchema_1.cloneOrPull)(repoUrl, repoLocalPath);
        latestSchemaStr = await (0, fetchSchema_1.readSchemaFromRepo)(repoLocalPath, process.env.SCHEMA_PATH || 'schema.graphql');
    }
    else {
        latestSchemaStr = await (0, fetchSchema_1.readLocalSchema)('./schemas/latest-schema.graphql');
    }
    const baselineSchema = (await fs_1.default.promises.readFile(baselinePath, 'utf8'));
    const baseSummary = (0, parseAndDiff_1.summarizeSchema)(baselineSchema);
    const latestSummary = (0, parseAndDiff_1.summarizeSchema)(latestSchemaStr);
    const diff = (0, parseAndDiff_1.diffSchemas)(baseSummary, latestSummary);
    await (0, writeOutputs_1.writeReport)('Machine diff JSON (see JSON file)', diff, 'reports');
    console.log('Calling LLM to analyze diffs and generate tests...');
    const llmResp = await (0, analyzeAndGenerate_1.analyzeWithLLM)(baseSummary, latestSummary, diff);
    await (0, writeOutputs_1.writeReport)(llmResp.report_text, { llmRaw: llmResp }, 'reports');
    await (0, writeOutputs_1.writeGeneratedTests)(llmResp.generated_tests, '.');
    console.log('Done. Reports and tests generated.');
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
});
