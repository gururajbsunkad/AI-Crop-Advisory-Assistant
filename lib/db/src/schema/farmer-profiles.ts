import { createInsertSchema } from "drizzle-zod";
import { numeric, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { z } from "zod/v4";

export const farmerProfilesTable = pgTable("farmer_profiles", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  village: text("village"),
  district: text("district"),
  state: text("state"),
  country: text("country").notNull().default("India"),
  farmingType: text("farming_type"),
  farmSizeAcres: numeric("farm_size_acres", { precision: 10, scale: 2 }),
  preferredLanguage: text("preferred_language").default("English"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertFarmerProfileSchema = createInsertSchema(farmerProfilesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertFarmerProfile = z.infer<typeof insertFarmerProfileSchema>;
export type FarmerProfile = typeof farmerProfilesTable.$inferSelect;