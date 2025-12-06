/**
 * Prompt Sanitization Utilities
 *
 * Prevents prompt injection attacks by sanitizing user inputs before
 * they're included in AI prompts.
 */

/**
 * Escape special characters that could be used for prompt injection
 * This prevents common injection patterns like:
 * - "text\n\nIGNORE INSTRUCTIONS"
 * - "text\" malicious command \""
 * - "text` malicious code `"
 */
export function sanitizePromptInput(input: string): string {
  if (!input || typeof input !== "string") {
    return "";
  }

  return input
    .trim()
    // Remove control characters
    .replace(/[\x00-\x1F\x7F]/g, "")
    // Escape backslashes first (must be first to avoid double-escaping)
    .replace(/\\/g, "\\\\")
    // Escape quotes
    .replace(/"/g, '\\"')
    .replace(/'/g, "\\'")
    // Limit consecutive newlines to prevent multi-line injections
    .replace(/\n{3,}/g, "\n\n")
    // Remove extremely long inputs that could be abuse
    .slice(0, 1000);
}

/**
 * Sanitize an array of strings (e.g., options, chapter names)
 */
export function sanitizePromptArray(items: string[]): string[] {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .filter((item) => typeof item === "string" && item.length > 0)
    .map(sanitizePromptInput)
    .slice(0, 50); // Limit array size
}

/**
 * Create a safe prompt value from an object
 * Serializes to JSON and sanitizes the result
 */
export function sanitizePromptObject(obj: Record<string, any>): string {
  try {
    const json = JSON.stringify(obj);
    // Truncate very large JSON objects
    return json.slice(0, 2000);
  } catch {
    return "";
  }
}

/**
 * Build a prompt section with a key-value pair safely
 */
export function buildPromptLine(key: string, value: string): string {
  const sanitizedKey = sanitizePromptInput(key);
  const sanitizedValue = sanitizePromptInput(value);
  return `${sanitizedKey}: ${sanitizedValue}`;
}

/**
 * Build a prompt section with an array safely
 */
export function buildPromptList(label: string, items: string[]): string {
  const sanitizedLabel = sanitizePromptInput(label);
  const sanitizedItems = sanitizePromptArray(items);

  if (sanitizedItems.length === 0) {
    return `${sanitizedLabel}: (none)`;
  }

  return (
    `${sanitizedLabel}: ` +
    sanitizedItems.map((item) => `"${item}"`).join(", ")
  );
}
