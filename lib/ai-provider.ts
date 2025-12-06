import { openai, isOpenAIConfigured } from "./openai";
import { getGeminiModel, isGeminiConfigured } from "./gemini";
import { recordAPIUsage } from "./ai-usage-monitor";

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
  userId?: string;
  endpoint?: string;
  trackUsage?: boolean;
}): Promise<string> {
  const {
    prompt,
    systemPrompt,
    temperature = 0.7,
    maxTokens,
    jsonMode = false,
    userId,
    endpoint = 'unknown',
    trackUsage = true,
  } = params;

  const configuredProviders = getConfiguredProviders();

  if (configuredProviders.length === 0) {
    throw new Error("No AI provider is configured. Please add OPENAI_API_KEY or GEMINI_API_KEY to your environment variables.");
  }

  let lastError: Error | null = null;
  const startTime = Date.now();

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

        // Record usage if tracking is enabled
        if (trackUsage) {
          const duration = Date.now() - startTime;
          recordAPIUsage({
            provider: 'openai',
            model: 'gpt-4o-mini',
            userId,
            endpoint,
            promptTokens: completion.usage?.prompt_tokens || 0,
            completionTokens: completion.usage?.completion_tokens || 0,
            responseLength: content.length,
            duration,
            success: true,
            metadata: {
              temperature,
              maxTokens,
              jsonMode,
            },
          }).catch((err) => console.error('Failed to record usage:', err));
        }

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

        // Record usage if tracking is enabled (Gemini doesn't provide token usage directly)
        if (trackUsage) {
          const duration = Date.now() - startTime;
          // Estimate tokens (roughly 1 token per 4 characters)
          const estimatedPromptTokens = Math.ceil(fullPrompt.length / 4);
          const estimatedCompletionTokens = Math.ceil(content.length / 4);

          recordAPIUsage({
            provider: 'gemini',
            model: 'gemini-1.5-flash',
            userId,
            endpoint,
            promptTokens: estimatedPromptTokens,
            completionTokens: estimatedCompletionTokens,
            responseLength: content.length,
            duration,
            success: true,
            metadata: {
              temperature,
              maxTokens,
              jsonMode,
              tokenEstimated: true,
            },
          }).catch((err) => console.error('Failed to record usage:', err));
        }

        return content;
      }
    } catch (error) {
      console.error(`✗ Failed to generate with ${provider}:`, error);
      lastError = error as Error;

      // Record failed usage if tracking is enabled
      if (trackUsage) {
        const duration = Date.now() - startTime;
        recordAPIUsage({
          provider,
          model: provider === 'openai' ? 'gpt-4o-mini' : 'gemini-1.5-flash',
          userId,
          endpoint,
          promptTokens: 0,
          completionTokens: 0,
          responseLength: 0,
          duration,
          success: false,
          errorMessage: (error as Error).message,
        }).catch((err) => console.error('Failed to record error usage:', err));
      }

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
