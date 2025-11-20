import OpenAI from "openai";

// Validate OpenAI API key at module initialization
if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "") {
  console.warn(
    "Warning: OPENAI_API_KEY is not configured. AI features will not be available. " +
    "Set the OPENAI_API_KEY environment variable to enable AI functionality."
  );
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export { openai };

// Helper function to check if OpenAI is configured
export function isOpenAIConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "";
}
