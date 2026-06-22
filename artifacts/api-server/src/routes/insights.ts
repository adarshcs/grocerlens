import { Router } from "express";
import { logger } from "../lib/logger";

const router = Router();

interface InsightsRequest {
  totalThisMonth: number;
  categoryTotals: Record<string, number>;
  billCount: number;
}

const DEFAULT_INSIGHTS = [
  {
    id: "ins-1",
    icon: "leaf-outline",
    title: "Grow your own leafy greens",
    body: "You're spending regularly on leafy greens. A small indoor herb kit (~$25 one-time) pays for itself in about 6 weeks.",
    tag: "Grow at home",
    saving: 18,
    tagColor: "#dcfce7",
    tagTextColor: "#15803d",
    cta: "See guide",
  },
  {
    id: "ins-2",
    icon: "pricetag-outline",
    title: "Switch to store-brand dairy",
    body: "Store-brand milk, yogurt, and cheese average 22% cheaper than name brands with comparable nutrition.",
    tag: "Quick win",
    saving: 10,
    tagColor: "#fef9c3",
    tagTextColor: "#854d0e",
    cta: "Compare",
  },
  {
    id: "ins-3",
    icon: "cube-outline",
    title: "Bulk-buy protein and freeze",
    body: "Warehouse clubs price chicken 40-50% cheaper per pound. Buying in bulk and portioning for the freezer is a major saver.",
    tag: "Bulk buy",
    saving: 40,
    tagColor: "#ede9fe",
    tagTextColor: "#6d28d9",
    cta: "Add reminder",
  },
];

router.post("/insights", async (req, res) => {
  const { totalThisMonth, categoryTotals, billCount } = req.body as InsightsRequest;

  const openaiKey = process.env["OPENAI_API_KEY"];
  const openaiBase = process.env["OPENAI_API_BASE"] ?? "https://api.openai.com/v1";

  if (!openaiKey) {
    logger.warn("OPENAI_API_KEY not set — returning default insights");
    res.json({ insights: DEFAULT_INSIGHTS });
    return;
  }

  try {
    const topCategories = Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([cat, amount]) => `${cat}: $${amount.toFixed(2)}`)
      .join(", ");

    const prompt = `You are a grocery budgeting AI. A household spent $${totalThisMonth.toFixed(2)} on groceries this month across ${billCount} shopping trips.

Top spending categories: ${topCategories || "General groceries"}

Generate exactly 4 actionable, specific money-saving suggestions. Each should be practical and reference actual spending patterns.

Return ONLY this JSON (no markdown, no code block):
{
  "insights": [
    {
      "id": "ins-1",
      "icon": "leaf-outline",
      "title": "Short title (max 6 words)",
      "body": "2-3 sentence specific explanation with dollar amounts",
      "tag": "Category (max 2 words)",
      "saving": 15,
      "tagColor": "#dcfce7",
      "tagTextColor": "#15803d",
      "cta": "Action (max 3 words)"
    }
  ]
}

Use these icon options: leaf-outline, pricetag-outline, cube-outline, calendar-outline, cart-outline, restaurant-outline, trending-down-outline, time-outline
Use varied tagColors: #dcfce7/#15803d (green), #fef9c3/#854d0e (yellow), #ede9fe/#6d28d9 (purple), #fff7ed/#c2410c (orange)`;

    const response = await fetch(`${openaiBase}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) throw new Error("OpenAI request failed");

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    const content = data.choices[0]?.message?.content ?? "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");

    const parsed = JSON.parse(jsonMatch[0]);
    res.json(parsed);
  } catch (err) {
    logger.error({ err }, "Insights generation failed");
    res.json({ insights: DEFAULT_INSIGHTS });
  }
});

export default router;
