import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import sql from "@/lib/db";
import { TIER_LIMITS } from "@/app/api/hbs/usage/route";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are HiveBuyStuff, a procurement routing engine. You receive a shopping template (a list of items with preferences) and a target backend (Walmart, Target, Amazon, or Instacart). Your job is to:

1. Map each item to the closest real product name for that backend.
2. Apply substitution rules at two levels:
   a. Per-item: each item has a "substitution_allowed" boolean. If false, map it EXACTLY as written — no swaps, no generics, no cheaper alternatives for that item. If true, apply the global tolerance below.
   b. Global tolerance (preferences.substitution_tolerance): "strict" = treat all items as substitution_allowed:false regardless of per-item value; "flexible" = suggest closest cheaper alternative for substitution_allowed:true items; "auto" = use judgment based on item type for substitution_allowed:true items.
3. Apply brand_tier per item (budget = store brand or cheapest, mid = national brand standard, premium = name brand or organic).
4. Apply dietary_rules to every item — filter or substitute products that violate them.
5. Return a JSON object only. No preamble. No explanation. Format:

{
  "backend": "walmart",
  "items": [
    { "original": "whole milk 1 gallon", "mapped": "Great Value Whole Milk 1 Gallon", "qty": 1 }
  ],
  "cart_url": "[deep link string]",
  "notes": "[any substitutions or dietary filters applied, one sentence max]"
}

For cart_url, construct a search URL using this pattern:
Walmart: https://www.walmart.com/search?q=[encoded+item+names+joined+by+comma]
Target: https://www.target.com/s?searchTerm=[encoded+items]
Amazon: https://www.amazon.com/s?k=[encoded+items]
Instacart: https://www.instacart.com/store/search_v3/term?term=[encoded+items]
Kroger: https://www.kroger.com/search?query=[encoded+items]

These are search links, not direct cart links. That is correct and expected for V1.`;

type CartResult = {
  backend: string;
  items: Array<{ original: string; mapped: string; qty: number }>;
  cart_url: string;
  notes: string;
};

function currentYearMonth(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || !body.template_id || !body.backend || !body.user_id) {
    return NextResponse.json(
      { error: "template_id, backend, and user_id are required" },
      { status: 400 }
    );
  }

  const { template_id, backend, user_id } = body;
  const ym = currentYearMonth();

  const [templateRows, prefRows, subRows, usageRows] = await Promise.all([
    sql`SELECT * FROM hbs_templates WHERE id = ${template_id} AND user_id = ${user_id}`,
    sql`SELECT * FROM hbs_preferences WHERE user_id = ${user_id}`,
    sql`SELECT tier FROM hbs_subscriptions WHERE user_id = ${user_id}`,
    sql`SELECT run_count FROM hbs_usage WHERE user_id = ${user_id} AND year_month = ${ym}`,
  ]);

  const template = templateRows[0];
  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  const tier = (subRows[0]?.tier ?? "free") as keyof typeof TIER_LIMITS;
  const run_count = usageRows[0]?.run_count ?? 0;
  const limit = TIER_LIMITS[tier].runs_per_month;

  if (run_count >= limit) {
    return NextResponse.json(
      {
        error: "Monthly run limit reached",
        tier,
        run_count,
        limit,
        upgrade_required: true,
      },
      { status: 429 }
    );
  }

  const prefs = prefRows[0] ?? {};

  const userMessage = JSON.stringify({
    template: { name: template.name, items: template.items },
    preferences: {
      substitution_tolerance: prefs.substitution_tolerance ?? "flexible",
      dietary_rules: prefs.dietary_rules ?? [],
      budget_ceiling: prefs.budget_ceiling ?? null,
    },
    backend,
  });

  const model =
    tier === "premium"
      ? "claude-opus-4-7"
      : "claude-haiku-4-5-20251001";

  const message = await anthropic.messages.create({
    model,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const rawText =
    message.content[0].type === "text" ? message.content[0].text : "";

  let cart: CartResult;
  try {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    cart = JSON.parse(jsonMatch ? jsonMatch[0] : rawText);
  } catch {
    return NextResponse.json({ error: "Failed to parse AI response", raw: rawText }, { status: 500 });
  }

  await sql`
    INSERT INTO hbs_usage (user_id, year_month, run_count)
    VALUES (${user_id}, ${ym}, 1)
    ON CONFLICT (user_id, year_month) DO UPDATE SET
      run_count = hbs_usage.run_count + 1
  `;

  return NextResponse.json({ ...cart, tier, run_count: run_count + 1 });
}
