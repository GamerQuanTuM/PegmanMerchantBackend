import { pgTable, varchar, uuid, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { outlet } from "./outlet.schema";

export const outletManager = pgTable("outlet_manager", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }),
  contactNumber: varchar("contact_number", { length: 10 }),
  email: varchar("email", { length: 320 }),
  createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow().$onUpdateFn(() => new Date()),
});

export const outletManagerRelations = relations(outletManager, ({ one }) => ({
  outlet: one(outlet, {
    fields: [outletManager.id],
    references: [outlet.managerId],
  }),
}))

export const insertOutletManagerSchema = createInsertSchema(outletManager).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  name: true,
  contactNumber: true,
  email: true,
}).extend({
  managerName: z.string().min(1, "Manager name is required").max(255),
  managerContactNumber: z.string().regex(/^\d{10}$/, "Contact number must be exactly 10 digits"),
  managerEmail: z.string().email("Invalid email format").max(320),
})

export const selectOutletManagerSchema = createSelectSchema(outletManager);