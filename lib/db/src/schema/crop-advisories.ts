import { createInsertSchema } from "drizzle-zod";
import { sql } from "drizzle-orm";
import {
  check,
  date,
  index,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { z } from "zod/v4";

export const cropAdvisoriesTable = pgTable(
  "crop_advisories",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    cropName: text("crop_name").notNull(),
    cropVariety: text("crop_variety"),
    location: text("location").notNull(),
    soilType: text("soil_type"),
    soilPh: numeric("soil_ph", { precision: 4, scale: 2 }),
    growthStage: text("growth_stage"),
    sowingDate: date("sowing_date", { mode: "string" }),
    irrigationMethod: text("irrigation_method"),
    irrigationFrequency: text("irrigation_frequency"),
    fertilizerUsage: text("fertilizer_usage"),
    symptoms: text("symptoms"),
    pestObservations: text("pest_observations"),
    diseaseObservations: text("disease_observations"),
    weatherConditions: text("weather_conditions"),
    mainConcern: text("main_concern").notNull(),
    additionalNotes: text("additional_notes"),
    status: text("status").notNull().default("PROCESSING"),
    riskLevel: text("risk_level"),
    confidence: text("confidence"),
    advisoryResult: jsonb("advisory_result"),
    aiModel: text("ai_model"),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("idx_crop_advisories_user_id").on(table.userId),
    index("idx_crop_advisories_created_at").on(table.createdAt),
    index("idx_crop_advisories_status").on(table.status),
    index("idx_crop_advisories_risk_level").on(table.riskLevel),
    check(
      "crop_advisories_status_check",
      sql`${table.status} IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')`,
    ),
    check(
      "crop_advisories_risk_level_check",
      sql`${table.riskLevel} IS NULL OR ${table.riskLevel} IN ('LOW', 'MODERATE', 'HIGH', 'CRITICAL')`,
    ),
    check(
      "crop_advisories_confidence_check",
      sql`${table.confidence} IS NULL OR ${table.confidence} IN ('LOW', 'MEDIUM', 'HIGH')`,
    ),
    check(
      "crop_advisories_soil_ph_check",
      sql`${table.soilPh} IS NULL OR (${table.soilPh} >= 0 AND ${table.soilPh} <= 14)`,
    ),
  ],
);

export const insertCropAdvisorySchema = createInsertSchema(cropAdvisoriesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertCropAdvisory = z.infer<typeof insertCropAdvisorySchema>;
export type CropAdvisory = typeof cropAdvisoriesTable.$inferSelect;