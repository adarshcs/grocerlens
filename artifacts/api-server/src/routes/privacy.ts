import { Router } from "express";

const router = Router();

router.get("/privacy", (_req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>GrocerLens — Privacy Policy</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 720px; margin: 0 auto; padding: 2rem 1.5rem; color: #111827; line-height: 1.7; }
    h1 { color: #15803d; font-size: 2rem; margin-bottom: 0.25rem; }
    h2 { color: #15803d; font-size: 1.2rem; margin-top: 2rem; }
    .meta { color: #6b7280; font-size: 0.9rem; margin-bottom: 2rem; }
    a { color: #15803d; }
    hr { border: none; border-top: 1px solid #e5e7eb; margin: 2rem 0; }
  </style>
</head>
<body>
  <h1>GrocerLens Privacy Policy</h1>
  <p class="meta">Last updated: June 2026</p>

  <p>GrocerLens ("we", "our", or "us") is a household grocery expense tracker for iOS and Android. This policy explains what data we collect, how we use it, and your rights.</p>

  <h2>1. Information We Collect</h2>
  <p><strong>Account information:</strong> When you sign in with Google or Apple, we receive your name and email address from the identity provider. We do not receive or store your Google or Apple passwords.</p>
  <p><strong>Receipt data:</strong> Photos and email receipts you submit are processed by our AI service (OpenAI) to extract the store name, date, total amount, and spending categories. The extracted data is stored in your household account.</p>
  <p><strong>Household data:</strong> Bills, spending totals, and category breakdowns are stored and shared with members of your household who you invite.</p>
  <p><strong>Usage data:</strong> We count how many receipt scans and AI insight refreshes you use each month to apply your free-tier quota.</p>

  <h2>2. How We Use Your Information</h2>
  <ul>
    <li>To provide the receipt scanning and expense tracking service</li>
    <li>To generate AI-powered spending insights for your household</li>
    <li>To enforce free-tier usage quotas and manage premium subscriptions</li>
    <li>To send receipts forwarded to your household email address to the app</li>
  </ul>

  <h2>3. Data Sharing</h2>
  <p>We do not sell your personal data. We share data only with the following service providers who help us operate GrocerLens:</p>
  <ul>
    <li><strong>OpenAI</strong> — receipt image and text processing for OCR and insights</li>
    <li><strong>Clerk</strong> — user authentication (Google and Apple sign-in)</li>
    <li><strong>SendGrid</strong> — email receipt forwarding</li>
    <li><strong>RevenueCat</strong> — subscription and in-app purchase management</li>
  </ul>
  <p>Your data is shared only with members of your household whom you have invited.</p>

  <h2>4. Data Retention</h2>
  <p>Your data is retained as long as your account is active. You may delete your household and all associated data at any time from within the app.</p>

  <h2>5. Security</h2>
  <p>Data is transmitted over HTTPS. We use industry-standard security practices to store and protect your information.</p>

  <h2>6. Children's Privacy</h2>
  <p>GrocerLens is not directed at children under the age of 13. We do not knowingly collect personal information from children.</p>

  <h2>7. Your Rights</h2>
  <p>You may request access to, correction of, or deletion of your personal data by contacting us at <a href="mailto:contact@grocerlens.app">contact@grocerlens.app</a>.</p>

  <h2>8. Changes to This Policy</h2>
  <p>We may update this policy from time to time. The latest version is always available at this URL. Continued use of the app after changes constitutes acceptance of the revised policy.</p>

  <h2>9. Contact</h2>
  <p>For privacy questions or requests, email us at <a href="mailto:contact@grocerlens.app">contact@grocerlens.app</a>.</p>

  <hr />
  <p style="color:#9ca3af; font-size:0.85rem;">GrocerLens &mdash; built for Indian households &mdash; 2026</p>
</body>
</html>`);
});

export default router;
