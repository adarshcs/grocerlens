import { db, usageQuotasTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export const FREE_LIMITS = { billScans: 4, insightRefreshes: 4 };

export interface QuotaStatus {
  billScans: { used: number; limit: number };
  insightRefreshes: { used: number; limit: number };
  isPremium: boolean;
}

function currentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function rowId(householdId: string, period: string): string {
  return `${householdId}-${period}`;
}

export async function getQuotaStatus(householdId: string): Promise<QuotaStatus> {
  const period = currentPeriod();
  const rows = await db
    .select()
    .from(usageQuotasTable)
    .where(eq(usageQuotasTable.id, rowId(householdId, period)))
    .limit(1);
  const row = rows[0];
  return {
    billScans: { used: row?.billScans ?? 0, limit: FREE_LIMITS.billScans },
    insightRefreshes: { used: row?.insightRefreshes ?? 0, limit: FREE_LIMITS.insightRefreshes },
    isPremium: row?.isPremium ?? false,
  };
}

export async function checkAndIncrementQuota(
  householdId: string,
  type: "billScans" | "insightRefreshes"
): Promise<{ allowed: boolean; used: number; limit: number; isPremium: boolean }> {
  const period = currentPeriod();
  const id = rowId(householdId, period);
  const limit = FREE_LIMITS[type];

  const rows = await db.select().from(usageQuotasTable).where(eq(usageQuotasTable.id, id)).limit(1);
  const row = rows[0];
  const isPremium = row?.isPremium ?? false;
  const used = row?.[type] ?? 0;

  if (!isPremium && used >= limit) {
    return { allowed: false, used, limit, isPremium };
  }

  const newUsed = used + 1;
  if (!row) {
    await db.insert(usageQuotasTable).values({
      id,
      householdId,
      period,
      billScans: type === "billScans" ? 1 : 0,
      insightRefreshes: type === "insightRefreshes" ? 1 : 0,
      isPremium: false,
      updatedAt: new Date(),
    });
  } else if (type === "billScans") {
    await db
      .update(usageQuotasTable)
      .set({ billScans: newUsed, updatedAt: new Date() })
      .where(eq(usageQuotasTable.id, id));
  } else {
    await db
      .update(usageQuotasTable)
      .set({ insightRefreshes: newUsed, updatedAt: new Date() })
      .where(eq(usageQuotasTable.id, id));
  }

  return { allowed: true, used: newUsed, limit, isPremium };
}

export async function softCountQuota(
  householdId: string,
  type: "billScans" | "insightRefreshes"
): Promise<void> {
  const period = currentPeriod();
  const id = rowId(householdId, period);
  const rows = await db.select().from(usageQuotasTable).where(eq(usageQuotasTable.id, id)).limit(1);
  const row = rows[0];
  const used = row?.[type] ?? 0;
  const newUsed = used + 1;
  if (!row) {
    await db.insert(usageQuotasTable).values({
      id,
      householdId,
      period,
      billScans: type === "billScans" ? 1 : 0,
      insightRefreshes: type === "insightRefreshes" ? 1 : 0,
      isPremium: false,
      updatedAt: new Date(),
    });
  } else if (type === "billScans") {
    await db.update(usageQuotasTable).set({ billScans: newUsed, updatedAt: new Date() }).where(eq(usageQuotasTable.id, id));
  } else {
    await db.update(usageQuotasTable).set({ insightRefreshes: newUsed, updatedAt: new Date() }).where(eq(usageQuotasTable.id, id));
  }
}
