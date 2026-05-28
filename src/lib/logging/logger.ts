export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
  source?: string;
  jobId?: string;
  stage?: string;
  durationMs?: number;
  error?: unknown;
  [key: string]: unknown;
}

function formatMessage(level: LogLevel, message: string, context?: LogContext) {
  return JSON.stringify({
    level,
    message,
    timestamp: new Date().toISOString(),
    ...context,
    error:
      context?.error instanceof Error
        ? { name: context.error.name, message: context.error.message, stack: context.error.stack }
        : context?.error,
  });
}

export const logger = {
  debug(message: string, context?: LogContext) {
    if (process.env.NODE_ENV !== "production") console.debug(formatMessage("debug", message, context));
  },
  info(message: string, context?: LogContext) {
    console.info(formatMessage("info", message, context));
  },
  warn(message: string, context?: LogContext) {
    console.warn(formatMessage("warn", message, context));
  },
  error(message: string, context?: LogContext) {
    console.error(formatMessage("error", message, context));
  },
};
