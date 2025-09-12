import fs from "fs/promises";
import path from "path";

/**
 * Extracts TypeScript code blocks from the LLM report_text
 * and saves them into .ts files.
 *
 * @param llmResponse The JSON returned by the LLM (with report_text containing code)
 * @param outBase Output folder (default = "generated-tests")
 */
export async function extractAndWriteTests(
  llmResponse: any,
  outBase = "reports"
): Promise<void> {
  if (!llmResponse || !llmResponse.report_text) {
    console.warn("⚠️ No report_text found in LLM response.");
    return;
  }

  const report: string = llmResponse.report_text;

  // Regex to capture ```typescript ... ```
  const regex = /```typescript([\s\S]*?)```/g;
  let match;
  let counter = 1;

  while ((match = regex.exec(report)) !== null) {
    const codeBlock = match[1].trim();

    const fileName = `generated-test-${counter}.ts`;
    const fullPath = path.join(outBase, fileName);

    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, codeBlock, "utf8");

    console.log(`✅ Extracted test file: ${fullPath}`);
    counter++;
  }

  if (counter === 1) {
    console.warn("⚠️ No TypeScript code blocks found in report_text.");
  }
}
