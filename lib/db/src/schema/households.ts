import { pgTable, text, timestamp, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const householdsTable = pgTable("households", {
  id: text("id").primaryKey(),
  inviteCode: text("invite_code").notNull().unique(),
  ownerDeviceId: text("owner_device_id").notNull(),
  receiptEmailPrefix: text("receipt_email_prefix").unique(),
  currencyCode: text("currency_code").notNull().default("INR"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const householdMembersTable = pgTable("household_members", {
  id: text("id").primaryKey(),
  householdId: text("household_id").notNull().references(() => householdsTable.id, { onDelete: "cascade" }),
  deviceId: text("device_id").notNull(),
  name: text("name").notNull(),
  initials: text("initials").notNull(),
  color: text("color").notNull().default("#22c55e"),
  email: text("email"),
  phone: text("phone"),
  isOwner: boolean("is_owner").notNull().default(false),
  joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
});

export const householdBillsTable = pgTable("household_bills", {
  id: text("id").primaryKey(),
  householdId: text("household_id").notNull().references(() => householdsTable.id, { onDelete: "cascade" }),
  addedByDeviceId: text("added_by_device_id").notNull(),
  store: text("store").notNull(),
  date: text("date").notNull(),
  total: real("total").notNull(),
  captureMethod: text("capture_method").notNull().default("manual"),
  addedAt: timestamp("added_at", { withTimezone: true }).notNull().defaultNow(),
});

export const billItemsTable = pgTable("bill_items", {
  id: text("id").primaryKey(),
  billId: text("bill_id").notNull().references(() => householdBillsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  qty: text("qty").notNull().default(""),
  price: real("price").notNull(),
  category: text("category").notNull().default("Pantry"),
});

export const insertHouseholdSchema = createInsertSchema(householdsTable);
export const insertMemberSchema = createInsertSchema(householdMembersTable);
export const insertBillSchema = createInsertSchema(householdBillsTable);
export const insertBillItemSchema = createInsertSchema(billItemsTable);

export type Household = typeof householdsTable.$inferSelect;
export type HouseholdMember = typeof householdMembersTable.$inferSelect;
export type HouseholdBill = typeof householdBillsTable.$inferSelect;
export type BillItem = typeof billItemsTable.$inferSelect;
