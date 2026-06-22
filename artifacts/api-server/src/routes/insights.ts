import { Router } from "express";
import { checkAndIncrementQuota, FREE_LIMITS } from "../lib/quota";
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
  stores?: string[];
  memberCount?: number;
  recentDates?: string[];
  currentDate?: string;
  householdId?: string;
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
    body: "Pulses and rice keep for months. Buying a 5 kg or 10 kg pack from a wholesale store or D-Mart typically saves 15–20% versus smaller supermarket packs.",
    tag: "Bulk buy",
    saving: 250,
    tagColor: "#ede9fe",
    tagTextColor: "#6d28d9",
    cta: "Add to list",
  },
  {
    id: "ins-3",
    icon: "calendar-outline",
    title: "Buy seasonal fruits, skip off-season",
    body: "Off-season fruits can cost 3–4× more. Sticking to what's in season cuts fruit spend significantly every month.",
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
    body: "Private-label cooking oils, masalas, and packaged spices from Lulu or D-Mart are typically 20–30% cheaper than branded equivalents with comparable quality.",
    tag: "Store brand",
    saving: 180,
    tagColor: "#fef9c3",
    tagTextColor: "#854d0e",
    cta: "Compare",
  },
];

function getSeasonContext(dateStr: string): { season: string; month: string; context: string } {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1; // 1–12
  const monthName = date.toLocaleDateString("en-IN", { month: "long" });

  if (month >= 6 && month <= 9) {
    return {
      season: "Monsoon (June–September)",
      month: monthName,
      context: `It is monsoon season in India. Key facts for this season:
- Tomato prices SPIKE sharply during monsoon (often ₹80–150/kg vs ₹20–30 in winter) due to crop damage — advise buying less or substituting with canned/cooked tomatoes.
- Leafy greens (spinach, methi, coriander) become expensive and spoil fast in humidity — buy smaller quantities more often or skip.
- Root vegetables (potato, onion, carrot, beetroot) are relatively stable — good for stocking.
- Avoid buying large quantities of fruits that spoil quickly in humidity (bananas, papaya).
- Coconut prices are generally stable in South India during monsoon.
- Good monsoon produce: raw banana, drumstick (moringa), jackfruit, yam, colocasia (arbi).
- Supermarket price markup is especially high during monsoon vs local wet markets.`,
    };
  }
  if (month >= 10 && month <= 11) {
    return {
      season: "Post-monsoon / early winter (October–November)",
      month: monthName,
      context: `Post-monsoon season — vegetable prices are beginning to fall as kharif crops arrive:
- Tomato prices drop significantly after October — good time to buy more.
- Pomegranate, guava, and citrus are in peak season — good value.
- Leafy greens improve in quality and drop in price.
- Onion supply improves, prices stabilising.`,
    };
  }
  if (month >= 12 || month <= 2) {
    return {
      season: "Winter (December–February)",
      month: monthName,
      context: `Winter is the best season for vegetables in India:
- Tomatoes, peas, carrots, cauliflower, capsicum are cheapest and best quality now.
- Good time to buy extra and freeze peas, corn.
- Strawberries available in some regions — seasonal treat.
- Avoid off-season items like mango (extremely expensive now).`,
    };
  }
  return {
    season: "Summer (March–May)",
    month: monthName,
    context: `Indian summer season:
- Mango season (April–June) — buy in bulk when prices peak mid-season then dip.
- Watermelon, muskmelon, litchi are in season and cheap.
- Vegetables get expensive (heat stress on crops) — especially tomatoes and greens.
- Onion prices may spike if previous monsoon crop was poor.
- Good time to stock up on dried/pantry items before monsoon price rises.`,
  };
}

function getStoreContext(stores: string[]): string {
  const storeNames = stores.join(", ");
  const hasLulu = stores.some((s) => /lulu/i.test(s));
  const hasBigBazaar = stores.some((s) => /big bazaar|bigbazaar/i.test(s));
  const hasRelianceFresh = stores.some((s) => /reliance/i.test(s));
  const hasDMart = stores.some((s) => /dmart|d-mart/i.test(s));
  const hasMoreSupermarket = stores.some((s) => /\bmore\b/i.test(s));

  const lines: string[] = [`This household shops at: ${storeNames}`];

  if (hasLulu) {
    lines.push(
      "Lulu Hypermarket is a premium-tier supermarket (common in Kerala and South India) with significantly higher margins than local markets or value chains. Produce at Lulu typically costs 40–60% more than at local wet markets. Their store-brand (Lulu brand) products however are competitively priced — recommend switching branded items to Lulu-brand equivalents. Kerala context: local markets (like Chalai Bazaar in Trivandrum, Broadway in Kochi) offer much cheaper fresh produce."
    );
  }
  if (hasBigBazaar) {
    lines.push(
      "Big Bazaar is a mid-tier hypermarket. Their 'Freshpik' and house-brand products offer good savings vs national brands. They run frequent weekend and member discounts."
    );
  }
  if (hasRelianceFresh) {
    lines.push(
      "Reliance Fresh focuses on fresh produce — prices are generally lower than Lulu but higher than local wet markets."
    );
  }
  if (hasDMart) {
    lines.push(
      "D-Mart is a value retailer with some of the lowest prices in India for packaged goods and staples. Recommend shifting more pantry purchases here."
    );
  }
  if (!hasLulu && !hasBigBazaar && !hasRelianceFresh && !hasDMart && !hasMoreSupermarket) {
    lines.push("Generic supermarket — standard advice on local market alternatives applies.");
  }

  return lines.join("\n");
}

router.post("/insights", async (req, res) => {
  const {
    totalThisMonth,
    categoryTotals,
    billCount,
    topItems,
    currencyCode,
    locale,
    stores = [],
    memberCount = 1,
    recentDates = [],
    currentDate,
    householdId,
  } = req.body as InsightsRequest;

  if (householdId) {
    const quota = await checkAndIncrementQuota(householdId, "insightRefreshes");
    if (!quota.allowed) {
      res.status(402).json({
        error: "quota_exceeded",
        type: "insightRefreshes",
        used: quota.used,
        limit: quota.limit,
        message: `You've used all ${FREE_LIMITS.insightRefreshes} free insight refreshes this month. Upgrade to continue.`,
      });
      return;
    }
  }

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
    const today = currentDate ?? new Date().toISOString().split("T")[0];

    const seasonInfo = getSeasonContext(today);
    const storeContext = stores.length > 0 ? getStoreContext(stores) : "Store information not available.";

    const topCategoriesText = Object.entries(categoryTotals)
      .filter(([cat]) => cat !== "Tax")
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([cat, amount]) => `  ${cat}: ${amount.toFixed(2)} ${currency}`)
      .join("\n");

    const topItemsText =
      topItems && topItems.length > 0
        ? topItems
            .slice(0, 20)
            .map(
              (i) =>
                `  - ${i.name} (${i.category}): bought ${i.count}×, total ₹${i.totalSpent.toFixed(2)}, avg ₹${i.avgPrice.toFixed(2)} each`
            )
            .join("\n")
        : "  No item-level data";

    const spendPerPerson =
      memberCount > 0 ? (totalThisMonth / memberCount).toFixed(2) : totalThisMonth.toFixed(2);

    const prompt = `You are an expert Indian household grocery savings analyst. Use ALL of the context below — actual items, store type, current season, and market dynamics — to generate 4 genuinely personalised, specific insights.

=== HOUSEHOLD SNAPSHOT ===
Date today: ${today} (${seasonInfo.month})
Household size: ${memberCount} member(s)
Total spend this period: ₹${totalThisMonth.toFixed(2)} across ${billCount} trip(s)
Per-person spend: ₹${spendPerPerson}
Currency: ${currency}

=== WHERE THEY SHOP ===
${storeContext}

=== CURRENT SEASON: ${seasonInfo.season} ===
${seasonInfo.context}

=== CATEGORY BREAKDOWN ===
${topCategoriesText || "  No category data"}

=== ACTUAL ITEMS PURCHASED (ranked by total spend) ===
${topItemsText}

=== YOUR TASK ===
Generate exactly 4 insights. Each insight MUST:
1. Be driven by THEIR ACTUAL DATA — name specific items, categories, and rupee amounts from above
2. Incorporate SEASON awareness — warn about monsoon price spikes, highlight what's cheap now, etc.
3. Incorporate STORE awareness — if they shop at Lulu, tell them exactly what they overpay vs alternatives
4. Give a CONCRETE, REALISTIC saving estimate in ₹/month (not a round number — calculate from their actual spend)
5. Have a specific, actionable recommendation — not "buy local" but "switch your tomato, spinach, and coriander purchases to a wet market; Lulu charges ₹60/kg for tomatoes vs ₹25/kg locally"
6. Body: 2–3 tight sentences. Data-driven. Mention actual item names and prices where possible.

Vary insight types across these options (pick the 4 that fit best given their data + season):
- Seasonal timing (avoid a price-spiking item, or stock up on something cheap now)
- Store substitution (shift specific items from premium store to local market or value chain)
- Bulk buy opportunity (specific item that stores well and they buy repeatedly)
- Category substitution (branded → store brand for a specific high-spend category)
- Waste reduction (small-quantity perishables in monsoon)
- Per-person budget observation (spend per head vs Indian averages)

Return ONLY valid JSON, no markdown:
{
  "insights": [
    {
      "id": "ins-1",
      "icon": "leaf-outline",
      "title": "Concise title, max 8 words",
      "body": "2-3 specific sentences with actual item names and rupee amounts.",
      "tag": "1-2 word label",
      "saving": 240,
      "tagColor": "#dcfce7",
      "tagTextColor": "#15803d",
      "cta": "Short action"
    }
  ]
}

Icon options: leaf-outline, pricetag-outline, cube-outline, calendar-outline, cart-outline, restaurant-outline, trending-down-outline, time-outline, flower-outline, sunny-outline, storefront-outline, scale-outline, rainy-outline, warning-outline
Tag color pairs (use 4 different ones): #dcfce7/#15803d, #fef9c3/#854d0e, #ede9fe/#6d28d9, #fff7ed/#c2410c, #dbeafe/#1d4ed8, #fce7f3/#9d174d`;

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
