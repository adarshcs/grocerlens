import { Router } from "express";
import { logger } from "../lib/logger";

const router = Router();

interface OCRRequest {
  imageBase64: string;
  mimeType?: string;
}

interface BillItem {
  id: string;
  name: string;
  qty: string;
  price: number;
  category: string;
}

interface OCRResponse {
  store: string;
  date: string;
  total: number;
  items: BillItem[];
}

const CATEGORY_MAP: Record<string, string> = {
  chicken: "Meat", beef: "Meat", pork: "Meat", turkey: "Meat", lamb: "Meat",
  fish: "Seafood", salmon: "Seafood", shrimp: "Seafood", tuna: "Seafood",
  milk: "Dairy", cheese: "Dairy", yogurt: "Dairy", butter: "Dairy", cream: "Dairy",
  apple: "Produce", banana: "Produce", tomato: "Produce", lettuce: "Produce", spinach: "Produce",
  carrot: "Produce", onion: "Produce", potato: "Produce", broccoli: "Produce", avocado: "Produce",
  rice: "Grains", bread: "Bakery", pasta: "Pantry", flour: "Pantry", cereal: "Grains",
  juice: "Drinks", water: "Drinks", soda: "Drinks", coffee: "Drinks", tea: "Drinks",
  chips: "Snacks", cookie: "Snacks", chocolate: "Snacks", candy: "Snacks",
  frozen: "Frozen", ice: "Frozen",
};

function guessCategory(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, cat] of Object.entries(CATEGORY_MAP)) {
    if (lower.includes(key)) return cat;
  }
  return "Pantry";
}

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

router.post("/ocr", async (req, res) => {
  const { imageBase64, mimeType = "image/jpeg" } = req.body as OCRRequest;

  if (!imageBase64) {
    res.status(400).json({ error: "imageBase64 is required" });
    return;
  }

  const openaiKey = process.env["AI_INTEGRATIONS_OPENAI_API_KEY"] ?? process.env["OPENAI_API_KEY"];
  const openaiBase = process.env["AI_INTEGRATIONS_OPENAI_BASE_URL"] ?? process.env["OPENAI_API_BASE"] ?? "https://api.openai.com/v1";

  if (!openaiKey) {
    logger.warn("No AI key configured — returning mock OCR data");
    const mockResponse: OCRResponse = {
      store: "Scanned Store",
      date: new Date().toISOString().split("T")[0],
      total: 42.5,
      items: [
        { id: generateId(), name: "Organic Milk", qty: "1 gal", price: 4.99, category: "Dairy" },
        { id: generateId(), name: "Whole Grain Bread", qty: "1 loaf", price: 3.49, category: "Bakery" },
        { id: generateId(), name: "Chicken Breast", qty: "2 lbs", price: 12.99, category: "Meat" },
        { id: generateId(), name: "Mixed Vegetables", qty: "16 oz", price: 4.49, category: "Produce" },
        { id: generateId(), name: "Pasta Sauce", qty: "24 oz", price: 3.99, category: "Pantry" },
        { id: generateId(), name: "Sparkling Water", qty: "12 pack", price: 6.99, category: "Drinks" },
        { id: generateId(), name: "Tax", qty: "", price: 1.55, category: "Tax" },
      ],
    };
    res.json(mockResponse);
    return;
  }

  try {
    const prompt = `You are a receipt parser. Analyze this grocery receipt image and extract all items.
Return ONLY valid JSON in this exact format:
{
  "store": "store name",
  "date": "YYYY-MM-DD",
  "total": 0.00,
  "items": [
    {"name": "item name", "qty": "quantity/unit", "price": 0.00, "category": "one of: Meat,Seafood,Produce,Dairy,Grains,Frozen,Snacks,Drinks,Pantry,Bakery,Deli,Tax,Other"},
    ...
  ]
}
Include a Tax item if tax appears. Use today's date if date is not visible.`;

    const response = await fetch(`${openaiBase}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        max_completion_tokens: 4000,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: { url: `data:${mimeType};base64,${imageBase64}` },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      logger.error({ status: response.status, err }, "OpenAI OCR request failed");
      throw new Error("OpenAI request failed");
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    const content = data.choices[0]?.message?.content ?? "";

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");

    const parsed = JSON.parse(jsonMatch[0]) as OCRResponse;

    const result: OCRResponse = {
      store: parsed.store ?? "Unknown Store",
      date: parsed.date ?? new Date().toISOString().split("T")[0],
      total: parsed.total ?? 0,
      items: (parsed.items ?? []).map((item) => ({
        id: generateId(),
        name: item.name ?? "Unknown item",
        qty: item.qty ?? "",
        price: typeof item.price === "number" ? item.price : parseFloat(String(item.price)) || 0,
        category: item.category ?? guessCategory(item.name),
      })),
    };

    res.json(result);
  } catch (err) {
    logger.error({ err }, "OCR processing failed");
    res.status(500).json({ error: "Failed to process receipt image" });
  }
});

export default router;
