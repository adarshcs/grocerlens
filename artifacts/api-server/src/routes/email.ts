import { Router } from "express";
import multer from "multer";
import { simpleParser } from "mailparser";
import { createRequire } from "node:module";
const _pdfMod = createRequire(import.meta.url)("pdf-parse") as any;
const PDFParse: new (opts: object) => { load(buf: Buffer): Promise<void>; getText(): Promise<string> } =
  _pdfMod.PDFParse ?? _pdfMod.default?.PDFParse ?? _pdfMod.default;

async function parsePdfBuffer(buf: Buffer): Promise<string> {
  // pdf-parse v2: data passed via constructor (goes to pdfjs getDocument)
  // getText() returns a LineStore object {pages:[{text,num},...]} not a plain string
  const parser = new PDFParse({ data: new Uint8Array(buf) } as object);
  const result: any = await parser.getText();
  if (typeof result === "string") return result;
  if (result && Array.isArray(result.pages)) {
    return result.pages
      .map((p: any) => (typeof p === "string" ? p : p.text ?? ""))
      .join("\n");
  }
  return String(result ?? "");
}
import { logger } from "../lib/logger";
import { db } from "@workspace/db";
import {
  householdsTable,
  householdBillsTable,
  billItemsTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";

/** Extract the first http/https URL from a block of text */
function extractUrl(text: string): string | null {
  const m = text.match(/https?:\/\/[^\s<>"']+/);
  return m ? m[0].replace(/[.,;!?]+$/, "") : null;
}

/** Fetch a receipt page URL and return its text content */
async function fetchReceiptPage(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; GrocerLens/1.0)",
      "Accept": "text/html,application/xhtml+xml",
    },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  return htmlToText(html);
}

/** Strip HTML tags and decode common entities to plain text */
function htmlToText(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?(p|div|tr|li|h[1-6])[^>]*>/gi, "\n")
    .replace(/<td[^>]*>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

interface ParsedBillItem {
  name: string;
  qty: string;
  price: number;
  category: string;
}

interface ParsedBill {
  store: string;
  date: string;
  total: number;
  items: ParsedBillItem[];
}

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

const CATEGORY_MAP: [RegExp, string][] = [
  [/\btax\b|\bvat\b|\bgst\b/i, "Tax"],
  // Use word boundaries for meat — avoids "steak-knife" → Meat
  [/\bchicken\b|\bbeef\b|\bpork\b|\bturkey\b|\blamb\b|\bmutton\b|\bsteak\b|\bsausage\b|\bbacon\b|\bham\b|\bbrisket\b|\bkeema\b|\bminced\b|\bgoat\b/i, "Meat"],
  [/\bfish\b|\bsalmon\b|\bshrimp\b|\btuna\b|\bcod\b|\bprawn\b|\bcrab\b|\blocster\b|\bscallop\b|\bhilsa\b|\brohu\b|\bcatla\b/i, "Seafood"],
  [/\bmilk\b|\bcheese\b|\byogurt\b|\bcurd\b|\bbutter\b|\bcream\b|\bghee\b|\bpaneer\b|\bkhoa\b|\bwhey\b/i, "Dairy"],
  // Produce: includes chilli/chili, green leafy veg, Indian produce
  [/\bapple\b|\bbanana\b|\btomato\b|\blettuce\b|\bspinach\b|\bcarrot\b|\bonion\b|\bpotato\b|\bbroccoli\b|\bavocado\b|\bberry\b|\bberries\b|\bgrape\b|\borange\b|\blemon\b|\blime\b|\bmango\b|\bpepper\b|\bcucumber\b|\bmushroom\b|\bcelery\b|\bkale\b|\bchilli\b|\bchili\b|\bgreen\s+chilli\b|\bcapsicum\b|\bbrinjal\b|\baudergine\b|\bokra\b|\bbittergourd\b|\bdrumstick\b|\bcolocasia\b|\bmethi\b|\bcoriander\b|\bmint\b|\bcabbage\b|\bcauliflower\b|\bpeas\b|\bgarlic\b|\bginger\b|\bcoconut\b|\bpapaya\b|\bpineapple\b|\bguava\b|\bpomegranate\b|\bwatermelon\b|\bbeetroot\b|\bradish\b|\bturnip\b|\bknol-khol\b|\bsnakegourd\b|\bridgegourd\b/i, "Produce"],
  [/\brice\b|\boat\b|\bcereal\b|\bquinoa\b|\bbarley\b|\bwheat\b|\brava\b|\bsuji\b|\bmaida\b|\batta\b|\bbread\b|\bbagel\b|\bbun\b|\bsourdough\b|\btortilla\b|\bpita\b|\bchapati\b|\broti\b|\bbiscuit\b|\bmuffin\b|\bcroissant\b/i, "Bakery"],
  [/\bpasta\b|\bnoodle\b|\bsauce\b|\bcanned\b|\bbeans\b|\blentil\b|\bdal\b|\bsoup\b|\bbroth\b|\boil\b|\bvinegar\b|\bspice\b|\bcondiment\b|\bketchup\b|\bmustard\b|\bmayo\b|\bsalsa\b|\bflour\b|\bsugar\b|\bhoney\b|\bjam\b|\bpickle\b|\bpapad\b|\bchutney\b|\bmasala\b|\bturmeric\b|\bcumin\b|\bcardamom\b|\bclove\b|\bpeanut\b/i, "Pantry"],
  [/\bjuice\b|\bwater\b|\bsoda\b|\bcoffee\b|\btea\b|\blatte\b|\bespresso\b|\bsparkling\b|\bkombucha\b|\bsmoothie\b|\bdrink\b|\bbeverage\b|\bnimbu\b|\blassi\b|\bsharbat\b/i, "Drinks"],
  [/\bchip\b|\bcookie\b|\bcracker\b|\bpopcorn\b|\bcandy\b|\bchocolate\b|\bsnack\b|\bnamkeen\b|\bmixture\b|\bhalwa\b|\bladdoo\b|\bbarfi\b/i, "Snacks"],
  [/\bfrozen\b|\bice\s*cream\b|\bgelato\b|\bsorbet\b|\bpopsicle\b/i, "Frozen"],
  [/\bsalami\b|\bprosciutto\b|\bpepperoni\b|\bdeli\b|\bcold\s*cut\b/i, "Deli"],
];

function guessCategory(name: string): string {
  for (const [re, cat] of CATEGORY_MAP) {
    if (re.test(name)) return cat;
  }
  return "Pantry";
}

function extractDate(text: string): string {
  const patterns = [
    /(\d{4}[-/]\d{1,2}[-/]\d{1,2})/,
    /(\d{1,2}[-/]\d{1,2}[-/]\d{4})/,
    /(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2},?\s+\d{4}/i,
    /\d{1,2}\s+(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4}/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) {
      const d = new Date(m[0]);
      if (!isNaN(d.getTime())) {
        return d.toISOString().split("T")[0];
      }
    }
  }
  return new Date().toISOString().split("T")[0];
}

function extractStore(text: string, subject: string): string {
  const combined = `${subject}\n${text.slice(0, 500)}`;
  const storePatterns = [
    /(?:thank you for shopping at|your receipt from|order from|purchase at|at (?:your )?)([A-Z][a-zA-Z\s&']{2,30}?)(?:\n|!|\.|\s*[,\-])/i,
    /^([A-Z][A-Z\s&']{2,25})\s*\n/m,
    /receipt from\s+([A-Z][a-zA-Z\s&']{2,25})/i,
    /Order Summary.*?at\s+([A-Z][a-zA-Z\s&']{2,25})/i,
  ];
  for (const p of storePatterns) {
    const m = combined.match(p);
    if (m?.[1]) {
      const name = m[1].trim().replace(/\s+/g, " ");
      if (name.length > 2 && name.length < 40) return name;
    }
  }
  const known = [
    "Whole Foods", "Trader Joe's", "Costco", "Walmart", "Target", "Kroger",
    "Safeway", "Publix", "Aldi", "Instacart", "Amazon Fresh", "Sprouts",
    "Wegmans", "HEB", "Meijer", "Giant", "Stop & Shop", "Food Lion", "Lidl",
  ];
  for (const s of known) {
    if (combined.toLowerCase().includes(s.toLowerCase())) return s;
  }
  return "Email Receipt";
}

function extractTotal(text: string): number {
  const patterns = [
    /total[:\s]+\$?([\d,]+\.?\d*)/i,
    /grand total[:\s]+\$?([\d,]+\.?\d*)/i,
    /order total[:\s]+\$?([\d,]+\.?\d*)/i,
    /amount (?:due|charged|paid)[:\s]+\$?([\d,]+\.?\d*)/i,
    /\$?([\d,]+\.\d{2})\s*(?:USD)?(?:\s|$)/g,
  ];
  let largest = 0;
  for (const p of patterns) {
    const m = text.match(p);
    if (m?.[1]) {
      const val = parseFloat(m[1].replace(/,/g, ""));
      if (val > largest) largest = val;
    }
  }
  return largest;
}

function parseLineItem(line: string): ParsedBillItem | null {
  const priceMatch = line.match(/\$\s*([\d,]+\.\d{2})/) ??
                     line.match(/([\d,]+\.\d{2})\s*$/) ??
                     line.match(/\.\.\.\s*\$?([\d,]+\.\d{2})/);
  if (!priceMatch) return null;

  const price = parseFloat(priceMatch[1].replace(",", ""));
  if (price <= 0 || price > 999999) return null;

  let name = line
    .replace(/\$[\d,.]+/g, "")
    .replace(/\.\.\./g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/[-–—]+$/, "")
    .replace(/^\s*[-•*]\s*/, "")
    .trim();

  const qtyMatch = name.match(/^([\d.]+\s*(?:x|×|lbs?|oz|kg|g|ct|pk|pack|bag|box|can|jar|gal|qt|pt|fl oz))\s+/i);
  let qty = "";
  if (qtyMatch) {
    qty = qtyMatch[1].trim();
    name = name.slice(qtyMatch[0].length).trim();
  }

  const parenMatch = name.match(/^(.*?)\s*\(([^)]+)\)/);
  if (parenMatch) {
    const inside = parenMatch[2];
    if (/\d/.test(inside)) qty = inside.trim();
    name = parenMatch[1].trim();
  }

  if (name.length < 2 || name.length > 60) return null;
  if (/^\d+$/.test(name)) return null;

  return { name, qty, price, category: guessCategory(name) };
}

function parseReceiptText(text: string, subject: string): ParsedBill {
  const store = extractStore(text, subject);
  const date = extractDate(text);

  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const items: ParsedBillItem[] = [];
  const skipPatterns = /^(subtotal|sub-total|total|grand total|tax|change|cash|credit|debit|card|balance|savings|you saved|reward|coupon|discount|tip|gratuity|amount due|order total|thank you|receipt|invoice|confirmation|store|address|phone|website|www\.|http)/i;

  for (const line of lines) {
    if (skipPatterns.test(line.trim())) {
      if (/tax/i.test(line)) {
        const taxMatch = line.match(/\$?([\d.]+)/g);
        const taxVal = taxMatch ? parseFloat(taxMatch[taxMatch.length - 1].replace("$", "")) : 0;
        if (taxVal > 0 && taxVal < 50) {
          items.push({ name: "Tax", qty: "", price: taxVal, category: "Tax" });
        }
      }
      continue;
    }
    const item = parseLineItem(line);
    if (item) items.push(item);
  }

  const total = extractTotal(text) || items.reduce((s, i) => s + i.price, 0);

  return { store, date, total, items };
}

async function parseReceiptWithAI(text: string, subject: string): Promise<ParsedBill | null> {
  const openaiKey = process.env["AI_INTEGRATIONS_OPENAI_API_KEY"] ?? process.env["OPENAI_API_KEY"];
  const openaiBase = process.env["AI_INTEGRATIONS_OPENAI_BASE_URL"] ?? process.env["OPENAI_API_BASE"] ?? "https://api.openai.com/v1";

  if (!openaiKey) return null;

  const today = new Date().toISOString().split("T")[0];
  // Send up to 12000 chars — Lulu India bills can be 8000+ chars
  const bodyText = text.slice(0, 12000);
  const prompt = `You are a grocery receipt parser. Extract structured data from this grocery bill/invoice.

Bill subject: "${subject}"
Bill text:
---
${bodyText}
---

Return ONLY valid, complete JSON — no markdown fences, no explanation, no truncation:
{
  "store": "store name (e.g. Lulu Hypermarket, Big Bazaar; use 'Unknown Store' if unclear)",
  "date": "YYYY-MM-DD (use today ${today} if not found)",
  "total": 0.00,
  "items": [
    {"name": "clean product name", "qty": "quantity with unit if available", "price": 0.00, "category": "one of: Meat,Seafood,Produce,Dairy,Grains,Frozen,Snacks,Drinks,Pantry,Bakery,Deli,Household,Tax,Other"}
  ]
}

RULES — read carefully:
1. "total" = the GRAND TOTAL / NET AMOUNT PAYABLE on the bill. Not a subtotal, not a line-item total.
2. Prices are in INR (Indian Rupees). Numbers like 6,832.25 mean six thousand eight hundred thirty-two.
3. Item names: use clean English product names (e.g. "Green Chilli" not "GRN CHILLI 3232"). Strip item codes, barcodes, SKUs.
4. Category rules:
   - Vegetables, fruits, chilli, capsicum, coriander, ginger, garlic → Produce
   - Knives, plates, containers, mops, hangers, cleaning tools → Household
   - Chicken, beef, mutton, lamb, pork (NOT knives or utensils) → Meat
   - Chips, namkeen, sweets, chocolate, biscuits → Snacks
   - Cooking oil, spices, masala, dal, rice, atta → Pantry
5. Skip non-item lines: barcodes, store address, MRP labels, loyalty points, payment mode.
6. If this is not a grocery receipt, return {"store":"","date":"","total":0,"items":[]}.
7. Include a Tax item for GST/VAT if present.`;

  try {
    const response = await fetch(`${openaiBase}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        max_completion_tokens: 8000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      logger.error({ status: response.status }, "AI receipt parse failed");
      return null;
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    const content = data.choices[0]?.message?.content ?? "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]) as ParsedBill;
    if (!parsed.store && parsed.items.length === 0) return null;
    return parsed;
  } catch (err) {
    logger.error({ err }, "AI receipt parse error");
    return null;
  }
}

router.post(
  "/email-inbound",
  upload.any(),
  async (req, res) => {
    const body = req.body as Record<string, string>;
    const from = body["from"] ?? "";
    const subject = body["subject"] ?? "";

    // Extract text: prefer plain text, fall back to HTML→text, then raw MIME parse
    let text = body["text"] ?? "";
    if (!text.trim() && body["html"]) {
      text = htmlToText(body["html"]);
    }
    // If still empty, try parsing the raw MIME email field (SendGrid "Post raw MIME" option)
    if (body["email"]) {
      try {
        const parsed = await simpleParser(body["email"]);
        // Extract body text
        if (!text.trim()) {
          text = parsed.text ?? (parsed.html ? htmlToText(parsed.html) : "");
        }
        // Also extract PDF attachments embedded in the MIME
        if (parsed.attachments?.length) {
          logger.info({ count: parsed.attachments.length }, "MIME attachments found");
          for (const att of parsed.attachments) {
            const isPdf =
              att.contentType === "application/pdf" ||
              att.filename?.toLowerCase().endsWith(".pdf");
            if (isPdf && att.content) {
              try {
                const pdfText = await parsePdfBuffer(att.content as Buffer);
                if (pdfText?.trim()) {
                  text = (text + "\n" + pdfText).trim();
                  logger.info({ filename: att.filename, chars: pdfText.length }, "PDF extracted from MIME attachment");
                }
              } catch (err) {
                logger.warn({ err, filename: att.filename }, "Failed to parse MIME PDF attachment");
              }
            }
          }
        }
      } catch (err) {
        logger.warn({ err }, "Failed to parse raw MIME email");
      }
    }

    const files = (req.files ?? []) as Express.Multer.File[];

    // Extract text from any PDF attachments (SendGrid sends files via multer)
    const pdfFiles = files.filter(
      (f) => f.mimetype === "application/pdf" || f.originalname?.toLowerCase().endsWith(".pdf")
    );
    if (pdfFiles.length > 0) {
      logger.info({ count: pdfFiles.length }, "PDF attachments found — extracting text");
      for (const pdf of pdfFiles) {
        try {
          const pdfText = await parsePdfBuffer(pdf.buffer);
          if (pdfText?.trim()) {
            text = (text + "\n" + pdfText).trim();
            logger.info({ pdfName: pdf.originalname, chars: pdfText.length }, "PDF text extracted");
          }
        } catch (err) {
          logger.warn({ err, pdfName: pdf.originalname }, "Failed to parse PDF attachment");
        }
      }
    }

    // Fallback: try body["attachment1"] etc. (SendGrid sometimes sends as raw form fields)
    if (!text.trim()) {
      for (let i = 1; i <= 10; i++) {
        const field = body[`attachment${i}`];
        if (!field) break;
        // If it starts with %PDF it's a raw PDF buffer encoded as latin1
        if (field.startsWith("%PDF")) {
          try {
            const buf = Buffer.from(field, "binary");
            const pdfText = await parsePdfBuffer(buf);
            if (pdfText?.trim()) {
              text = (text + "\n" + pdfText).trim();
              logger.info({ field: `attachment${i}`, chars: pdfText.length }, "PDF extracted from body field");
            }
          } catch (err) {
            logger.warn({ err, field: `attachment${i}` }, "Failed to parse PDF body field");
          }
        }
      }
    }

    let toAddress = body["to"] ?? "";
    if (body["envelope"]) {
      try {
        const envelope = JSON.parse(body["envelope"]) as { to?: string[] };
        toAddress = envelope.to?.[0] ?? toAddress;
      } catch { /* keep toAddress */ }
    }
    toAddress = toAddress.replace(/[<>]/g, "").trim();
    const localPart = toAddress.split("@")[0] ?? "";

    logger.info({ from, to: toAddress, subject, textLength: text.length }, "Inbound email received");

    if (!localPart) {
      logger.warn({ toAddress }, "Could not extract local part from to address");
      res.json({ status: "ok", parsed: false, reason: "no_local_part" });
      return;
    }

    const [household] = await db
      .select()
      .from(householdsTable)
      .where(eq(householdsTable.receiptEmailPrefix, localPart))
      .limit(1);

    if (!household) {
      logger.warn({ localPart }, "No household matched this email prefix");
      res.json({ status: "ok", parsed: false, reason: "no_household_match" });
      return;
    }

    // If the body is empty or very short, look for a receipt URL and fetch it
    const receiptUrl = extractUrl(text);
    if (receiptUrl && (text.trim().length < 500 || !text.trim())) {
      logger.info({ receiptUrl }, "Email body contains a receipt URL — fetching page");
      try {
        const pageText = await fetchReceiptPage(receiptUrl);
        if (pageText.length > 50) {
          text = pageText;
          logger.info({ textLength: text.length }, "Receipt page fetched successfully");
        }
      } catch (err) {
        logger.warn({ err, receiptUrl }, "Failed to fetch receipt URL");
      }
    }

    if (!text.trim()) {
      logger.warn({ from, subject }, "Email body is empty after all extraction attempts");
      res.json({ status: "ok", parsed: false, reason: "empty_body" });
      return;
    }

    const aiResult = await parseReceiptWithAI(text, subject);
    const parsed: ParsedBill = aiResult ?? parseReceiptText(text, subject);

    if (parsed.items.length === 0) {
      logger.warn({ from, subject }, "No items found in email receipt");
      res.json({ status: "ok", parsed: false, reason: "no_items_found" });
      return;
    }

    const billId = generateId();
    const total = parsed.total > 0
      ? parsed.total
      : parsed.items.reduce((s, i) => s + i.price, 0);

    await db.insert(householdBillsTable).values({
      id: billId,
      householdId: household.id,
      addedByDeviceId: "email",
      store: parsed.store || "Email Receipt",
      date: parsed.date || new Date().toISOString().split("T")[0],
      total,
      captureMethod: "email",
    }).onConflictDoNothing();

    if (parsed.items.length > 0) {
      await db.insert(billItemsTable).values(
        parsed.items.map((item) => ({
          id: generateId(),
          billId,
          name: item.name,
          qty: item.qty || "",
          price: item.price,
          category: item.category || "Pantry",
        }))
      ).onConflictDoNothing();
    }

    logger.info(
      { householdId: household.id, billId, store: parsed.store, total, itemCount: parsed.items.length },
      "Email receipt parsed and saved"
    );

    res.json({
      status: "ok",
      parsed: true,
      billId,
      store: parsed.store,
      total,
      itemCount: parsed.items.length,
    });
  }
);

export default router;
