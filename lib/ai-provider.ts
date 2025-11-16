import { openai, isOpenAIConfigured } from "./openai";
import { getGeminiModel, isGeminiConfigured } from "./gemini";

export type AIProvider = "openai" | "gemini";

interface AIProviderConfig {
  name: AIProvider;
  isConfigured: () => boolean;
  priority: number;
}

// Configuration for available AI providers with priority order
const providers: AIProviderConfig[] = [
  {
    name: "openai",
    isConfigured: isOpenAIConfigured,
    priority: 1, // Higher priority (try first)
  },
  {
    name: "gemini",
    isConfigured: isGeminiConfigured,
    priority: 2, // Lower priority (fallback)
  },
];

/**
 * Get the available AI provider based on configuration and priority
 * Returns the first configured provider based on priority
 */
export function getAvailableProvider(): AIProvider | null {
  const availableProviders = providers
    .filter((p) => p.isConfigured())
    .sort((a, b) => a.priority - b.priority);

  return availableProviders.length > 0 ? availableProviders[0].name : null;
}

/**
 * Check if any AI provider is configured
 */
export function isAnyAIConfigured(): boolean {
  return providers.some((p) => p.isConfigured());
}

/**
 * Get all configured providers
 */
export function getConfiguredProviders(): AIProvider[] {
  return providers
    .filter((p) => p.isConfigured())
    .sort((a, b) => a.priority - b.priority)
    .map((p) => p.name);
}

/**
 * Generate chat completion using available AI provider with automatic fallback
 */
export async function generateChatCompletion(params: {
  prompt: string;
  systemPrompt: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}): Promise<string> {
  const { prompt, systemPrompt, temperature = 0.7, maxTokens, jsonMode = false } = params;

  const configuredProviders = getConfiguredProviders();

  if (configuredProviders.length === 0) {
    throw new Error("No AI provider is configured. Please add OPENAI_API_KEY or GEMINI_API_KEY to your environment variables.");
  }

  let lastError: Error | null = null;

  // Try each configured provider in priority order
  for (const provider of configuredProviders) {
    try {
      console.log(`Attempting to use ${provider} for AI generation...`);

      if (provider === "openai") {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt },
          ],
          temperature,
          ...(maxTokens && { max_tokens: maxTokens }),
          ...(jsonMode && { response_format: { type: "json_object" } }),
        });

        const content = completion.choices[0].message.content;
        if (!content) {
          throw new Error("No response from OpenAI");
        }

        console.log(`✓ Successfully generated response using OpenAI`);
        return content;
      } else if (provider === "gemini") {
        const model = getGeminiModel("gemini-1.5-flash");

        // Combine system prompt and user prompt for Gemini
        const fullPrompt = `${systemPrompt}\n\n${prompt}`;

        const generationConfig = {
          temperature,
          ...(maxTokens && { maxOutputTokens: maxTokens }),
          ...(jsonMode && { responseMimeType: "application/json" }),
        };

        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
          generationConfig,
        });

        const response = result.response;
        const content = response.text();

        if (!content) {
          throw new Error("No response from Gemini");
        }

        console.log(`✓ Successfully generated response using Gemini`);
        return content;
      }
    } catch (error) {
      console.error(`✗ Failed to generate with ${provider}:`, error);
      lastError = error as Error;
      // Continue to next provider
    }
  }

  // If all providers failed, throw the last error
  throw new Error(
    `All AI providers failed. Last error: ${lastError?.message || "Unknown error"}`
  );
}

/**
 * Get information about current AI configuration
 */
export function getAIProviderInfo() {
  const configuredProviders = getConfiguredProviders();
  const activeProvider = getAvailableProvider();

  return {
    activeProvider,
    configuredProviders,
    totalConfigured: configuredProviders.length,
    hasOpenAI: isOpenAIConfigured(),
    hasGemini: isGeminiConfigured(),
  };
}
