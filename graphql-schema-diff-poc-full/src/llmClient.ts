import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
const apiKey = process.env.GEMINI_API_KEY!;
dotenv.config();
if (!apiKey) {
  console.warn("No GEMINI_API_KEY found. LLM calls using Gemini will fail unless provided.");
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function askLLM(
  prompt: string,
  maxTokens = 800,
): Promise<string> {
  try {
    const response = await model.generateContent(prompt);

    return response.response.text() || "No response from Gemini";
  } catch (err) {
    console.error("Gemini API error:", err);
    throw err;
  }
}
