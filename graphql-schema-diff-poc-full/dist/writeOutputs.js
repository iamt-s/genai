"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeReport = writeReport;
exports.writeGeneratedTests = writeGeneratedTests;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
async function writeReport(reportText, reportJson, outFolder = 'reports') {
    await promises_1.default.mkdir(outFolder, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const mdFile = path_1.default.join(outFolder, `schema-diff-report-${timestamp}.md`);
    const jsonFile = path_1.default.join(outFolder, `schema-diff-${timestamp}.json`);
    await promises_1.default.writeFile(mdFile, reportText, 'utf8');
    await promises_1.default.writeFile(jsonFile, JSON.stringify(reportJson, null, 2), 'utf8');
    return { mdFile, jsonFile };
}
async function writeGeneratedTests(generatedTests, outBase = '.') {
    for (const t of generatedTests) {
        const full = path_1.default.join(outBase, t.fileName);
        await promises_1.default.mkdir(path_1.default.dirname(full), { recursive: true });
        await promises_1.default.writeFile(full, t.content, 'utf8');
    }
}
