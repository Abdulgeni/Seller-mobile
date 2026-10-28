type LogLevel = "debug" | "info" | "warn" | "error";

interface LogPayload {
  message: string;
  context?: Record<string, unknown> | undefined;
  error?: Error | unknown | undefined;
}

const PII_PATTERNS = [
  // Phone numbers (e.g. +254712345678, 0712345678)
  { regex: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4,6}/g, replacement: "[REDACTED_PHONE]" },
  // Email addresses
  { regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, replacement: "[REDACTED_EMAIL]" },
  // Bearer tokens / JWTs
  { regex: /Bearer\s+[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/gi, replacement: "Bearer [REDACTED_TOKEN]" },
];

function redactString(text: string): string {
  let redacted = text;
  for (const { regex, replacement } of PII_PATTERNS) {
    redacted = redacted.replace(regex, replacement);
  }
  return redacted;
}

function redactObject(obj: unknown): unknown {
  if (typeof obj === "string") {
    return redactString(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(redactObject);
  }
  if (obj !== null && typeof obj === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (/password|pin|token|secret|auth/i.test(k)) {
        sanitized[k] = "[REDACTED_SECRET]";
      } else {
        sanitized[k] = redactObject(v);
      }
    }
    return sanitized;
  }
  return obj;
}

function writeLog(level: LogLevel, payload: LogPayload): void {
  const timestamp = new Date().toISOString();
  const sanitizedMessage = redactString(payload.message);
  const sanitizedContext = payload.context ? redactObject(payload.context) : undefined;

  const entry = {
    timestamp,
    level,
    message: sanitizedMessage,
    ...(sanitizedContext ? { context: sanitizedContext } : {}),
    ...(payload.error instanceof Error ? { error: payload.error.message, stack: payload.error.stack } : {}),
  };

  if (level === "error") {
    // eslint-disable-next-line no-console
    console.error(JSON.stringify(entry));
  } else if (level === "warn") {
    // eslint-disable-next-line no-console
    console.warn(JSON.stringify(entry));
  } else {
    // eslint-disable-next-line no-console
    console.warn(`[${level.toUpperCase()}] ${JSON.stringify(entry)}`);
  }
}

export const logger = {
  debug: (message: string, context?: Record<string, unknown>): void => {
    writeLog("debug", { message, context });
  },
  info: (message: string, context?: Record<string, unknown>): void => {
    writeLog("info", { message, context });
  },
  warn: (message: string, context?: Record<string, unknown>): void => {
    writeLog("warn", { message, context });
  },
  error: (message: string, error?: unknown, context?: Record<string, unknown>): void => {
    writeLog("error", { message, error, context });
  },
};
