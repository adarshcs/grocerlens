import { Router } from "express";
import { logger } from "../lib/logger";

const router = Router();

router.post("/email-inbound", (req, res) => {
  const { from, subject, text, html } = req.body as {
    from?: string;
    subject?: string;
    text?: string;
    html?: string;
  };

  logger.info({ from, subject }, "Inbound email receipt received");

  const urlMatches =
    (text ?? html ?? "").match(/https?:\/\/[^\s"<>]+receipt[^\s"<>]*/gi) ?? [];

  if (urlMatches.length === 0) {
    logger.warn({ from, subject }, "No receipt URL found in email");
    res.json({ status: "ok", parsed: false, reason: "no_receipt_url" });
    return;
  }

  logger.info({ url: urlMatches[0] }, "Found receipt URL in email");
  res.json({
    status: "ok",
    parsed: true,
    receiptUrl: urlMatches[0],
  });
});

export default router;
