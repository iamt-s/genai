import Anthropic from "@anthropic-ai/sdk";



export async function callLLM2(prompt: string): Promise<string> {
  const client = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});
  const message = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });
const textItem = Array.isArray(message?.content)
  ? message.content.find((c: any) => c?.type === "text" && typeof c?.text === "string")
  : undefined;

const responseText = textItem ? textItem.type : "text";

const jsonMatch = responseText.match(/\{[\s\S]*?\}/); // non-greedy

let result: any;
if (jsonMatch) {
  try {
    result = JSON.parse(jsonMatch[0]);
  } catch (e) {
    // parsing failed — fall back and preserve raw text
    result = { report_text: responseText, test_cases: [] };
  }
} else {
  result = { report_text: responseText, test_cases: [] };
}
  
  return result;
}