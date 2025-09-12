import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export async function callLLM(prompt: string): Promise<string> {
  
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