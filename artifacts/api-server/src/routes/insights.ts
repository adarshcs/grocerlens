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
    title: "Buy vegetables from local sabzi market",
    body: "Supermarket vegetables cost 30–50% more than your nearest sabzi mandi or wet market. A weekly trip for staples like tomato, onion, and greens can save ₹300–500/month without any change in quality.",
    tag: "Quick win",
    saving: 400,
    tagColor: "#dcfce7",
    tagTextColor: "#15803d",
    cta: "Find markets",
  },
  {
    id: "ins-2",
    icon: "cube-outline",
    title: "Stock up on dal and rice in bulk",
    body: "Pulses and rice are pantry staples that keep for months. Buying a 5 kg or 10 kg pack from a wholesale store or D-Mart typically saves 15–20% versus smaller supermarket packs.",
    tag: "Bulk buy",
    saving: 250,
    tagColor: "#ede9fe",
    tagTextColor: "#6d28d9",
    cta: "Add to list",
  },
  {
    id: "ins-3",
    icon: "calendar-outline",
    title: "Buy seasonal fruits, skip off-season ones",
    body: "Off-season fruits like mangoes in winter or strawberries in summer can cost 3–4× more. Sticking to what's in season (check local market prices) cuts fruit spend significantly.",
    tag: "Seasonal",
    saving: 300,
    tagColor: "#fff7ed",
    tagTextColor: "#c2410c",
    cta: "See calendar",
  },
  {
    id: "ins-4",
    icon: "pricetag-outline",
    title: "Switch to store-brand oils and spices",
    body: "Private-label cooking oils, masalas, and packaged spices from Lulu, More, or D-Mart are typically 20–30% cheaper than branded equivalents with comparable quality — a consistent monthly saving.",
    tag: "Store brand",
    saving: 180,
    tagColor: "#fef9c3",
    tagTextColor: "#854d0e",
    cta: "Compare",
  },
];

router.post("/insights", async (req, res) => {
  const { totalThisMonth, categoryTotals, billCount, topItems, currencyCode, locale } =
    req.body as InsightsRequest;

  const openaiKey = process.env["AI_INTEGRATIONS_OPENAI_API_KEY"] ?? process.env["OPENAI_API_KEY"];
  const openaiBase =
    process.env["AI_INTEGRATIONS_OPENAI_BASE_URL"] ??
    process.env["OPENAI_API_BASE"] ??
    "https://api.openai.com/v1";

  if (!openaiKey) {
    logger.warn("No AI key configured — returning default insights");
    res.json({ insights: DEFAULT_INSIGHTS });
    return;
  }

  try {
    const currency = currencyCode ?? "INR";
    const isINR = currency === "INR";

    const topCategoriesText = Object.entries(categoryTotals)
      .filter(([cat]) => cat !== "Tax")
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([cat, amount]) => `${cat}: ${amount.toFixed(2)} ${currency}`)
      .join("\n");

    const topItemsText =
      topItems && topItems.length > 0
        ? topItems
            .slice(0, 15)
            .map(
              (i) =>
                `- ${i.name} (${i.category}): bought ${i.count}× total, spent ${i.totalSpent.toFixed(2)} ${currency}, avg ${i.avgPrice.toFixed(2)} ${currency} each`
            )
            .join("\n")
        : "No item-level data available";

    const indianContext = isINR
      ? `
IMPORTANT — this household shops in India (currency: INR). Apply India-specific knowledge:
- Supermarkets in India (Lulu Hypermarket, Big Bazaar, Reliance Fresh, More, D-Mart) are often 20–40% pricier than local wet markets / sabzi mandis for fresh produce.
- Bulk staples (dal, rice, atta, cooking oil) are significantly cheaper at wholesale or D-Mart vs branded packs.
- Indian seasonal produce: mangoes (Apr–Jun), pomegranate (Oct–Feb), tomato (Nov–Jan is peak season, cheap), guava (Oct–Mar). Off-season prices spike 2–3×.
- Common bulk-buy opportunities: 5 kg or 10 kg packs of rice/atta/dal, 5 L oil tins.
- Local farms / kisan markets (farmer's markets) often sell vegetables at 40–60% of supermarket prices.
- Do NOT mention: warehouse clubs (Costco/Sam's Club), avocados as a staple, dollar/pound amounts, growing food in $12 pots, or US/UK supermarkets.`
      : "";

    const prompt = `You are a grocery savings analyst. Analyse this household's ACTUAL purchase history and generate 4 personalised, specific, actionable money-saving insights.
${indianContext}

ACTUAL SPENDING DATA:
- Total this period: ${totalThisMonth.toFixed(2)} ${currency} across ${billCount} trip(s)
- Currency: ${currency}

TOP SPENDING CATEGORIES (sorted by spend):
${topCategoriesText || "No category data"}

ACTUAL ITEMS PURCHASED (most expensive first):
${topItemsText}

Generate exactly 4 insights. Each must:
1. Reference ACTUAL items or categories from the data above (e.g. "You spent ₹842 on Chicken across 3 trips")
2. Give SPECIFIC numbers — use actual prices from the data to estimate realistic savings
3. Be genuinely actionable for this household, not generic advice
4. Vary the type: price substitution, seasonal timing, bulk buying, local market vs supermarket — pick whichever types best fit their actual data
5. Body: 2–3 sentences. Specific, data-driven, never vague. Mention actual item names and amounts.
6. Savings estimate: realistic monthly saving in ${currency} based on their actual spend — NOT a round number

Return ONLY valid JSON, no markdown:
{
  "insights": [
    {
      "id": "ins-1",
      "icon": "leaf-outline",
      "title": "Concise title, max 7 words",
      "body": "2-3 specific sentences referencing their actual items and amounts.",
      "tag": "1-2 word label",
      "saving": 240,
      "tagColor": "#dcfce7",
      "tagTextColor": "#15803d",
      "cta": "Short action"
    }
  ]
}

Icon options (pick best fit): leaf-outline, pricetag-outline, cube-outline, calendar-outline, cart-outline, restaurant-outline, trending-down-outline, time-outline, flower-outline, sunny-outline, storefront-outline, scale-outline
Tag color pairs (pick 4 different ones): #dcfce7/#15803d, #fef9c3/#854d0e, #ede9fe/#6d28d9, #fff7ed/#c2410c, #dbeafe/#1d4ed8, #fce7f3/#9d174d`;

    const response = await fetch(`${openaiBase}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        max_completion_tokens: 2000,
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
    logger.info({ count: parsed.insights?.length }, "AI insights generated");
    res.json(parsed);
  } catch (err) {
    logger.error({ err }, "Insights generation failed");
    res.json({ insights: DEFAULT_INSIGHTS });
  }
});

export default router;
