import Anthropic from "@anthropic-ai/sdk";
import { env } from "@/lib/env";

let client: Anthropic | null | undefined;

export function getAnthropicClient() {
  if (client !== undefined) return client;
  client = env.anthropicApiKey ? new Anthropic({ apiKey: env.anthropicApiKey }) : null;
  return client;
}