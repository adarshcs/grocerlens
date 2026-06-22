import { Router } from "express";
import { logger } from "../lib/logger";

const router = Router();

interface ItemSummary {
  name: string;
  category: string;
  totalSpent: number;
  count: number;
  avgPrice: number;
}

interface InsightsRequest {
  totalThisMonth: number;
  categoryTotals: Record<string, number>;
  billCount: number;
  topItems?: ItemSummary[];
  currencyCode?: string;
  locale?: string;
}

const DEFAULT_INSIGHTS = [
  {
    id: "ins-1",
    icon: "leaf-outline",
    title: "Grow your own cherry tomatoes",
    body: "Cherry tomatoes appear frequently in your shopping. A $12 pot + seeds yields ~2kg/month, saving you the equivalent of 3–4 pints at supermarket prices — payback in under 6 weeks.",
    tag: "Grow at home",
    saving: 22,
    tagColor: "#dcfce7",
    tagTextColor: "#15803d",
    cta: "See guide",
  },
  {
    id: "ins-2",
    icon: "pricetag-outline",
    title: "Switch dairy to store brand",
    body: "Your dairy spend is one of the top categories. Store-brand milk, yogurt and cheese average 22% cheaper with comparable nutrition — a consistent saving every month.",
    tag: "Quick win",
    saving: 12,
    tagColor: "#fef9c3",
    tagTextColor: "#854d0e",
    cta: "Compare",
  },
  {
    id: "ins-3",
    icon: "cube-outline",
    title: "Bulk-buy chicken and freeze",
    body: "Chicken appears across multiple trips at full retail price. Buying a 10 lb pack from a warehouse club costs 40–50% less per pound — portion and freeze for the same convenience.",
    tag: "Bulk buy",
    saving: 38,
    tagColor: "#ede9fe",
    tagTextColor: "#6d28d9",
    cta: "Add reminder",
  },
  {
    id: "ins-4",
    icon: "trending-down-outline",
    title: "Avocado prices drop mid-season",
    body: "Avocado prices typically fall 30–40% in late summer (July–September). Buying extra when they're cheap and freezing halves lets you lock in the lower price year-round.",
    tag: "Price alert",
    saving: 15,
    tagColor: "#fff7ed",
    tagTextColor: "#c2410c",
    cta: "Set reminder",
  },
];

router.post("/insights", async (req, res) => {
  const { totalThisMonth, categoryTotals, billCount, topItems, currencyCode, locale } =
    req.body as InsightsRequest;

  const openaiKey = process.env["AI_INTEGRATIONS_OPENAI_API_KEY"] ?? process.env["OPENAI_API_KEY"];
  const openaiBase = process.env["AI_INTEGRATIONS_OPENAI_BASE_URL"] ?? process.env["OPENAI_API_BASE"] ?? "https://api.openai.com/v1";

  if (!openaiKey) {
    logger.warn("No AI key configured — returning default insights");
    res.json({ insights: DEFAULT_INSIGHTS });
    return;
  }

  try {
    const currency = currencyCode ?? "USD";

    const topCategoriesText = Object.entries(categoryTotals)
      .filter(([cat]) => cat !== "Tax")
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([cat, amount]) => `${cat}: ${amount.toFixed(2)} ${currency}`)
      .join("\n");

    const topItemsText = topItems && topItems.length > 0
      ? topItems
          .slice(0, 12)
          .map(
            (i) =>
              `- ${i.name} (${i.category}): bought ${i.count}× this period, total ${i.totalSpent.toFixed(2)} ${currency}, avg ${i.avgPrice.toFixed(2)} ${currency} each`
          )
          .join("\n")
      : "No item-level data";

    const prompt = `You are a sharp grocery savings analyst for a household app.

ACTUAL SPENDING DATA:
Total this period: ${totalThisMonth.toFixed(2)} ${currency} across ${billCount} trips
Currency: ${currency} (locale: ${locale ?? "en-US"})

TOP SPENDING CATEGORIES:
${topCategoriesText}

ACTUAL ITEMS PURCHASED (most expensive first):
${topItemsText}

Generate exactly 4 hyper-specific, actionable savings suggestions. Rules:
1. Reference ACTUAL item names from the list above wherever possible (e.g. "You bought Baby Spinach 3× this month")
2. Give SPECIFIC dollar/currency amounts — use the actual prices from the data
3. Include at least one "grow your own" tip (referencing a specific herb or vegetable they actually buy)
4. Include at least one seasonal price alert (e.g. "avocado prices rise in winter — buy extra now")
5. Include at least one bulk-buy tip for a protein or pantry item they actually purchased
6. Make savings estimates realistic and specific (not round numbers like $50)
7. Body text: 2-3 sentences, specific and data-driven. Never be vague.

Return ONLY valid JSON, no markdown:
{
  "insights": [
    {
      "id": "ins-1",
      "icon": "leaf-outline",
      "title": "Concise title max 7 words",
      "body": "2-3 sentences with specific item names and amounts from their data.",
      "tag": "1-2 word label",
      "saving": 18,
      "tagColor": "#dcfce7",
      "tagTextColor": "#15803d",
      "cta": "Short action"
    }
  ]
}

Icon options: leaf-outline, pricetag-outline, cube-outline, calendar-outline, cart-outline, restaurant-outline, trending-down-outline, time-outline, flower-outline, sunny-outline
Tag color pairs (pick varied): #dcfce7/#15803d, #fef9c3/#854d0e, #ede9fe/#6d28d9, #fff7ed/#c2410c, #dbeafe/#1d4ed8`;

    const response = await fetch(`${openaiBase}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        max_completion_tokens: 1200,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) throw new Error(`OpenAI request failed: ${response.status}`);

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    const content = data.choices[0]?.message?.content ?? "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");

    const parsed = JSON.parse(jsonMatch[0]) as { insights: typeof DEFAULT_INSIGHTS };
    res.json(parsed);
  } catch (err) {
    logger.error({ err }, "Insights generation failed");
    res.json({ insights: DEFAULT_INSIGHTS });
  }
});

export default router;
