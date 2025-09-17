import fs from 'fs/promises';
import path from 'path';

export async function writeReport(reportText: string, reportJson: any, outFolder = 'reports') {
  await fs.mkdir(outFolder, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  //const mdFile = path.join(outFolder, `schema-diff-report-${timestamp}.md`);
  const jsonFile = path.join(outFolder, `schema-diff-${timestamp}.json`);
  //await fs.writeFile(mdFile, reportText, 'utf8');
  await fs.writeFile(jsonFile, JSON.stringify(reportJson, null, 2), 'utf8');
  return { jsonFile };
}

export async function writeDiff(reportText: string, reportJson: any, outFolder = 'reports') {
  await fs.mkdir(outFolder, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const mdFile = path.join(outFolder, `schema-diff-report-${timestamp}.md`);
  await fs.writeFile(mdFile, reportText, 'utf8');
  return { mdFile };
}

export async function writeGeneratedTests(generatedTests: {fileName: string, content: string}[], outBase = '.') {
  for (const t of generatedTests) {
    const full = path.join(outBase, t.fileName);
    await fs.mkdir(path.dirname(full), { recursive: true });
    await fs.writeFile(full, t.content, 'utf8');
  }
}