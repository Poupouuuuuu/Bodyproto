import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const clients = sqliteTable("clients", {
  id: text("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  consentGiven: integer("consent_given", { mode: "boolean" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export const consultations = sqliteTable("consultations", {
  id: text("id").primaryKey(),
  clientId: text("client_id").notNull().references(() => clients.id, { onDelete: "cascade" }),
  profileJson: text("profile_json").notNull(),
  protocolJson: text("protocol_json").notNull(),
  dietaryAnalysisJson: text("dietary_analysis_json"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export type ClientRow = typeof clients.$inferSelect;
export type ConsultationRow = typeof consultations.$inferSelect;
