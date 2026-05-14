import { redactPHI } from "./phi";

type SafeMeta = Record<string, unknown>;

function write(level: "info" | "warn" | "error", message: string, meta?: SafeMeta) {
  const safeMessage = redactPHI(message);
  const safeMeta = meta ? JSON.parse(redactPHI(meta)) : undefined;
  const payload = safeMeta ? [safeMessage, safeMeta] : [safeMessage];
  if (level === "error") console.error(...payload);
  else if (level === "warn") console.warn(...payload);
  else console.info(...payload);
}

export const safeLogger = {
  logInfo: (message: string, meta?: SafeMeta) => write("info", message, meta),
  logWarn: (message: string, meta?: SafeMeta) => write("warn", message, meta),
  logError: (message: string, meta?: SafeMeta) => write("error", message, meta)
};
