import { GoogleGenAI } from "@google/genai";

// NOTE: In a real production app, this call would likely go through a backend proxy 
// to keep the API key secure. For this demo, we assume the environment variable is injected.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const GeminiService = {
  askNutritionist: async (question: string, userAgeGroup: string = "Student"): Promise<string> => {
    try {
      const model = 'gemini-2.5-flash';
      const prompt = `
        You are a friendly and helpful school nutritionist. 
        The user is a ${userAgeGroup}. 
        Answer their question about food, nutrition, or diet briefly and encouragingly (under 100 words).
        Question: ${question}
      `;

      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
      });

      return response.text || "I couldn't generate a response right now.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Sorry, I'm having trouble connecting to the nutrition brain right now.";
    }
  }
};