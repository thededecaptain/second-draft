const SENSITIVE_KEYS = new Set([
  "text",
  "draft",
  "rewrite",
  "message",
  "api_key",
  "apiKey",
  "token",
  "authorization",
  "password",
  "secret",
  "ciphertext",
  "plaintext",
  "ANTHROPIC_API_KEY",
]);

const REDACTED = "[REDACTED]";

function shouldRedactKey(key: string): boolean {
  const lower = key.toLowerCase();
  return (
    SENSITIVE_KEYS.has(key) ||
    lower.includes("secret") ||
    lower.includes("token") ||
    lower.includes("password") ||
    lower.includes("key") && lower.includes("api")
  );
}

function redactObject(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (shouldRedactKey(key)) {
      out[key] = REDACTED;
    } else if (typeof value === "object" && value !== null) {
      out[key] = Array.isArray(value)
        ? value.map((v) =>
            typeof v === "object" && v !== null
              ? redactObject(v as Record<string, unknown>)
              : v
          )
        : redactObject(value as Record<string, unknown>);
    } else {
      out[key] = value;
    }
  }
  return out;
}

export function safeLog(
  level: "info" | "warn" | "error",
  message: string,
  meta?: Record<string, unknown>
): void {
  const payload = meta ? redactObject(meta) : undefined;
  const line = payload ? `${message} ${JSON.stringify(payload)}` : message;
  switch (level) {
    case "info":
      console.info(line);
      break;
    case "warn":
      console.warn(line);
      break;
    case "error":
      console.error(line);
      break;
  }
}
