"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.askLLM = askLLM;
const openai_1 = __importDefault(require("openai"));
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
    console.warn("No OPENAI_API_KEY found. LLM calls will fail unless provided.");
}
const client = new openai_1.default({ apiKey });
async function askLLM(prompt, maxTokens = 800) {
    const resp = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: maxTokens,
        temperature: 0.1,
    });
    return resp.choices?.[0]?.message?.content ?? "";
}
