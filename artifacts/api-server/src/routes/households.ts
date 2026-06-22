import { Router } from "express";
import { eq, and } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  householdsTable,
  householdMembersTable,
  householdBillsTable,
  billItemsTable,
} from "@workspace/db";

const router = Router();

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function generateReceiptEmailPrefix(): string {
  const suffix = Math.random().toString(36).substring(2, 10);
  return `gl-${suffix}`;
}

function getReceiptEmail(prefix: string | null | undefined, req: Parameters<Parameters<typeof router.get>[1]>[0]): string {
  if (!prefix) return "";
  const domain = process.env["SENDGRID_INBOUND_DOMAIN"] ?? getPublicDomain(req);
  return `${prefix}@${domain}`;
}

function getPublicDomain(req: Parameters<Parameters<typeof router.get>[1]>[0]): string {
  const domains = process.env.REPLIT_DOMAINS;
  if (domains) return domains.split(",")[0].trim();
  return req.get("host") || "localhost";
}

// POST /api/households — create a new household for a device
router.post("/households", async (req, res) => {
  const { deviceId, ownerName } = req.body as { deviceId: string; ownerName: string };
  if (!deviceId || !ownerName) {
    res.status(400).json({ error: "deviceId and ownerName required" });
    return;
  }

  // Check if device already has a household
  const existing = await db
    .select({ householdId: householdMembersTable.householdId })
    .from(householdMembersTable)
    .where(eq(householdMembersTable.deviceId, deviceId))
    .limit(1);

  if (existing.length > 0) {
    const [household] = await db
      .select()
      .from(householdsTable)
      .where(eq(householdsTable.id, existing[0].householdId))
      .limit(1);
    const members = await db
      .select()
      .from(householdMembersTable)
      .where(eq(householdMembersTable.householdId, household.id));
    const bills = await db
      .select()
      .from(householdBillsTable)
      .where(eq(householdBillsTable.householdId, household.id));
    const billsWithItems = await Promise.all(
      bills.map(async (bill) => {
        const items = await db
          .select()
          .from(billItemsTable)
          .where(eq(billItemsTable.billId, bill.id));
        return { ...bill, items };
      })
    );
    res.json({
      householdId: household.id,
      inviteCode: household.inviteCode,
      receiptEmail: getReceiptEmail(household.receiptEmailPrefix, req),
      bills: billsWithItems,
      members,
    });
    return;
  }

  const householdId = crypto.randomUUID();
  const inviteCode = generateInviteCode();
  const receiptEmailPrefix = generateReceiptEmailPrefix();
  const memberId = crypto.randomUUID();
  const initials = ownerName
    .split(" ")
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2) || "ME";

  await db.insert(householdsTable).values({
    id: householdId,
    inviteCode,
    ownerDeviceId: deviceId,
    receiptEmailPrefix,
  });

  await db.insert(householdMembersTable).values({
    id: memberId,
    householdId,
    deviceId,
    name: ownerName,
    initials,
    color: "#15803d",
    isOwner: true,
  });

  res.json({ householdId, inviteCode, receiptEmail: getReceiptEmail(receiptEmailPrefix, req), bills: [], members: [] });
});

// GET /api/households/device/:deviceId — get household for a device
router.get("/households/device/:deviceId", async (req, res) => {
  const { deviceId } = req.params;
  const memberRow = await db
    .select()
    .from(householdMembersTable)
    .where(eq(householdMembersTable.deviceId, deviceId))
    .limit(1);

  if (memberRow.length === 0) {
    res.status(404).json({ error: "No household found for device" });
    return;
  }

  const householdId = memberRow[0].householdId;
  const [household] = await db
    .select()
    .from(householdsTable)
    .where(eq(householdsTable.id, householdId))
    .limit(1);

  const members = await db
    .select()
    .from(householdMembersTable)
    .where(eq(householdMembersTable.householdId, householdId));

  const bills = await db
    .select()
    .from(householdBillsTable)
    .where(eq(householdBillsTable.householdId, householdId));

  const billsWithItems = await Promise.all(
    bills.map(async (bill) => {
      const items = await db
        .select()
        .from(billItemsTable)
        .where(eq(billItemsTable.billId, bill.id));
      return { ...bill, items };
    })
  );

  res.json({
    householdId: household.id,
    inviteCode: household.inviteCode,
    receiptEmail: getReceiptEmail(household.receiptEmailPrefix, req),
    isOwner: household.ownerDeviceId === deviceId,
    bills: billsWithItems,
    members,
  });
});

// GET /api/households/code/:inviteCode — look up household by invite code
router.get("/households/code/:inviteCode", async (req, res) => {
  const { inviteCode } = req.params;
  const [household] = await db
    .select()
    .from(householdsTable)
    .where(eq(householdsTable.inviteCode, inviteCode.toUpperCase()))
    .limit(1);

  if (!household) {
    res.status(404).json({ error: "Invalid invite code" });
    return;
  }

  const members = await db
    .select()
    .from(householdMembersTable)
    .where(eq(householdMembersTable.householdId, household.id));

  const bills = await db
    .select()
    .from(householdBillsTable)
    .where(eq(householdBillsTable.householdId, household.id));

  const owner = members.find((m) => m.isOwner);

  res.json({
    householdId: household.id,
    inviteCode: household.inviteCode,
    ownerName: owner?.name ?? "Someone",
    memberCount: members.length,
    billCount: bills.length,
  });
});

// POST /api/households/:id/join — join a household
router.post("/households/:id/join", async (req, res) => {
  const { id } = req.params;
  const { deviceId, name } = req.body as { deviceId: string; name: string };

  if (!deviceId || !name) {
    res.status(400).json({ error: "deviceId and name required" });
    return;
  }

  const [household] = await db
    .select()
    .from(householdsTable)
    .where(eq(householdsTable.id, id))
    .limit(1);

  if (!household) {
    res.status(404).json({ error: "Household not found" });
    return;
  }

  // Check if already a member
  const existing = await db
    .select()
    .from(householdMembersTable)
    .where(
      and(
        eq(householdMembersTable.householdId, id),
        eq(householdMembersTable.deviceId, deviceId)
      )
    )
    .limit(1);

  const COLORS = ["#22c55e", "#0284c7", "#9333ea", "#f59e0b", "#ef4444", "#06b6d4"];
  const members = await db
    .select()
    .from(householdMembersTable)
    .where(eq(householdMembersTable.householdId, id));

  let memberId: string;
  if (existing.length > 0) {
    memberId = existing[0].id;
  } else {
    memberId = crypto.randomUUID();
    const initials = name
      .split(" ")
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("")
      .slice(0, 2) || "?";
    const color = COLORS[members.length % COLORS.length];

    await db.insert(householdMembersTable).values({
      id: memberId,
      householdId: id,
      deviceId,
      name,
      initials,
      color,
      isOwner: false,
    });
  }

  const updatedMembers = await db
    .select()
    .from(householdMembersTable)
    .where(eq(householdMembersTable.householdId, id));

  const bills = await db
    .select()
    .from(householdBillsTable)
    .where(eq(householdBillsTable.householdId, id));

  const billsWithItems = await Promise.all(
    bills.map(async (bill) => {
      const items = await db
        .select()
        .from(billItemsTable)
        .where(eq(billItemsTable.billId, bill.id));
      return { ...bill, items };
    })
  );

  res.json({
    success: true,
    householdId: id,
    inviteCode: household.inviteCode,
    receiptEmail: getReceiptEmail(household.receiptEmailPrefix, req),
    isOwner: household.ownerDeviceId === deviceId,
    bills: billsWithItems,
    members: updatedMembers,
  });
});

// GET /api/households/:id/sync — pull latest bills + members
router.get("/households/:id/sync", async (req, res) => {
  const { id } = req.params;

  const members = await db
    .select()
    .from(householdMembersTable)
    .where(eq(householdMembersTable.householdId, id));

  const bills = await db
    .select()
    .from(householdBillsTable)
    .where(eq(householdBillsTable.householdId, id));

  const billsWithItems = await Promise.all(
    bills.map(async (bill) => {
      const items = await db
        .select()
        .from(billItemsTable)
        .where(eq(billItemsTable.billId, bill.id));
      return { ...bill, items };
    })
  );

  const [household] = await db
    .select()
    .from(householdsTable)
    .where(eq(householdsTable.id, id))
    .limit(1);

  res.json({
    bills: billsWithItems,
    members,
    receiptEmail: household ? getReceiptEmail(household.receiptEmailPrefix, req) : "",
    currencyCode: household?.currencyCode ?? "INR",
  });
});

// POST /api/households/:id/bills — add a bill
router.post("/households/:id/bills", async (req, res) => {
  const { id } = req.params;
  const { bill, deviceId } = req.body as {
    bill: {
      id: string;
      store: string;
      date: string;
      total: number;
      captureMethod: string;
      items: { id: string; name: string; qty: string; price: number; category: string }[];
    };
    deviceId: string;
  };

  if (!bill || !deviceId) {
    res.status(400).json({ error: "bill and deviceId required" });
    return;
  }

  await db
    .insert(householdBillsTable)
    .values({
      id: bill.id,
      householdId: id,
      addedByDeviceId: deviceId,
      store: bill.store,
      date: bill.date,
      total: bill.total,
      captureMethod: bill.captureMethod,
    })
    .onConflictDoNothing();

  if (bill.items && bill.items.length > 0) {
    await db
      .insert(billItemsTable)
      .values(
        bill.items.map((item) => ({
          id: item.id,
          billId: bill.id,
          name: item.name,
          qty: item.qty || "",
          price: item.price,
          category: item.category || "Pantry",
        }))
      )
      .onConflictDoNothing();
  }

  res.json({ success: true, billId: bill.id });
});

// DELETE /api/households/:id/bills/:billId — remove a bill
router.delete("/households/:id/bills/:billId", async (req, res) => {
  const { billId } = req.params;
  await db.delete(billItemsTable).where(eq(billItemsTable.billId, billId));
  await db.delete(householdBillsTable).where(eq(householdBillsTable.id, billId));
  res.json({ success: true });
});

// GET /api/invite/:code — HTML invite page
router.get("/invite/:code", async (req, res) => {
  const { code } = req.params;
  const upperCode = code.toUpperCase();
  const domain = getPublicDomain(req);
  const appLink = `grocerlens://join/${upperCode}`;

  const [household] = await db
    .select()
    .from(householdsTable)
    .where(eq(householdsTable.inviteCode, upperCode))
    .limit(1);

  let ownerName = "Someone";
  let memberCount = 0;
  if (household) {
    const members = await db
      .select()
      .from(householdMembersTable)
      .where(eq(householdMembersTable.householdId, household.id));
    const owner = members.find((m) => m.isOwner);
    ownerName = owner?.name ?? "Someone";
    memberCount = members.length;
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Join ${ownerName}'s Household — GrocerLens</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #f0fdf4;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      background: white;
      border-radius: 24px;
      padding: 40px 32px;
      max-width: 400px;
      width: 100%;
      text-align: center;
      box-shadow: 0 4px 24px rgba(21,128,61,0.12);
    }
    .icon { font-size: 64px; margin-bottom: 16px; }
    h1 { font-size: 26px; font-weight: 700; color: #15803d; margin-bottom: 8px; }
    .subtitle { color: #6b7280; font-size: 16px; margin-bottom: 32px; line-height: 1.5; }
    .code-box {
      background: #f0fdf4;
      border: 2px solid #86efac;
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 28px;
    }
    .code-label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #6b7280; margin-bottom: 8px; }
    .code { font-size: 36px; font-weight: 800; color: #15803d; letter-spacing: 0.12em; font-family: monospace; }
    .members { font-size: 13px; color: #9ca3af; margin-top: 8px; }
    .open-btn {
      display: block;
      background: #15803d;
      color: white;
      text-decoration: none;
      padding: 16px 24px;
      border-radius: 14px;
      font-size: 17px;
      font-weight: 600;
      margin-bottom: 16px;
      transition: background 0.2s;
    }
    .open-btn:hover { background: #166534; }
    .hint {
      font-size: 13px;
      color: #9ca3af;
      line-height: 1.6;
    }
    .hint strong { color: #374151; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">🛒</div>
    <h1>You're invited!</h1>
    <p class="subtitle"><strong>${ownerName}</strong> wants you to join their GrocerLens household to track grocery expenses together.</p>
    <div class="code-box">
      <div class="code-label">Your invite code</div>
      <div class="code">${upperCode}</div>
      <div class="members">${memberCount} member${memberCount !== 1 ? "s" : ""} already in this household</div>
    </div>
    <a href="${appLink}" class="open-btn">📱 Open in GrocerLens</a>
    <p class="hint">
      Don't have the app? Download <strong>GrocerLens</strong> and enter code <strong>${upperCode}</strong> under the Family tab.
    </p>
  </div>
  <script>
    document.querySelector('.open-btn').addEventListener('click', function(e) {
      e.preventDefault();
      window.location.href = '${appLink}';
    });
  </script>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html");
  res.send(html);
});

export default router;
