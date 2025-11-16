import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini client
const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

export { genAI };

// Helper function to check if Gemini is configured
export function isGeminiConfigured(): boolean {
  return !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "";
}

// Get Gemini model instance
export function getGeminiModel(modelName: string = "gemini-1.5-flash") {
  if (!genAI) {
    throw new Error("Gemini API key is not configured");
  }
  return genAI.getGenerativeModel({ model: modelName });
}
