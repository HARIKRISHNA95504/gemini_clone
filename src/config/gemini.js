import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: "AIzaSyDdXKML1lELXMUSuL6wxBDt4RkjYt0fp18" });

async function generateWithRetry(prompt, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      });

      const candidates = result?.candidates;
      const text = candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error("No text response returned from Gemini API.");
      }

      return text;
    } catch (error) {
      const isOverloaded = error?.message?.includes("503") || error?.status === 503;

      if (isOverloaded && i < retries - 1) {
        console.warn(`Gemini API overloaded (attempt ${i + 1}). Retrying in ${delay}ms...`);
        await new Promise(res => setTimeout(res, delay * (i + 1))); 
        continue;
      }

      console.error("Gemini API error:", error);
      throw error;
    }
  }
}

export async function main(prompt) {
  if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
    throw new Error("Invalid prompt: Must be a non-empty string.");
  }

  return await generateWithRetry(prompt);
}


