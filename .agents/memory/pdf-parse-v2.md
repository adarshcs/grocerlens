---
name: pdf-parse v2 API
description: How to correctly use pdf-parse v2.x in an ESM/esbuild context — class-based API, not a plain function
---

## Rule
`pdf-parse` v2 exports a **`PDFParse` class** (not a callable function). The buffer must be passed as `{ data: new Uint8Array(buf) }` to the **constructor** (not to `load()`). `getText()` returns a `LineStore` object `{ pages: [{text, num}] }`, not a plain string.

**Why:** pdf-parse upgraded from v1 (simple function returning `{text}`) to v2 (class-based, pdfjs-dist under the hood). The named export is `PDFParse`, not a default function.

**How to apply:**
```ts
import { createRequire } from "node:module";
const _pdfMod = createRequire(import.meta.url)("pdf-parse") as any;
// _pdfMod.PDFParse is the class; _pdfMod itself is NOT a function
const PDFParse = _pdfMod.PDFParse;

async function parsePdfBuffer(buf: Buffer): Promise<string> {
  const parser = new PDFParse({ data: new Uint8Array(buf) });
  const result: any = await parser.getText(); // LineStore, not string
  if (typeof result === "string") return result;
  if (result?.pages) {
    return result.pages.map((p: any) => p.text ?? "").join("\n");
  }
  return String(result ?? "");
}
```

Also externalize `pdf-parse` in esbuild (`external: ["pdf-parse"]`) so it's loaded via CJS require at runtime, not bundled.

SendGrid raw MIME: PDF attachments land in `parsed.attachments` from mailparser's `simpleParser(body["email"])`. The `email` field is present (not `text`/`html`) when SendGrid posts raw MIME.
