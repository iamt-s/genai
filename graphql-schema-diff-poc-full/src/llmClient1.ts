// src/llmClient.ts
import dotenv from "dotenv";
import axios from "axios";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";//
// get Gemini API key from env var
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("No GEMINI_API_KEY found. LLM calls using Gemini will fail unless provided.");
}

//const aiClient = new GoogleGenAI({ apiKey });

/**
 * Ask Gemini to generate content with the given prompt.
 * Uses model "gemini-2.0-flash" (or override via param).
 * @param prompt The prompt to send.
 * @param maxTokens Maximum number of output tokens (if supported).
 * @param model Optional: which Gemini model to use (default: "gemini-2.0-flash").
 */
export async function askLLMWithGemini(
  prompt: string,
  maxTokens = 800,

): Promise<string> {
  try {
      const response = await axios.post(
        `${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
  
      
      return response.data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from Gemini";
    } catch (error: any) {
      console.error('Gemini API call failed:', error?.response?.data || error?.message || error);
      throw new Error('Gemini API call failed: ' + (error?.response?.data?.error?.message || error?.message || error));
    }
}
