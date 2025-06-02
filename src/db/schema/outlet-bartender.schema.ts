import { pgTable, varchar, uuid, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { outlet } from "./outlet.schema";

export const outletBartender = pgTable("outlet_bartender", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }),
  contactNumber: varchar("contact_number", { length: 10 }),
  createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow().$onUpdateFn(() => new Date()),
});

export const outletBartenderRelations = relations(outletBartender, ({ one }) => ({
  outlet: one(outlet, {
    fields: [outletBartender.id],
    references: [outlet.bartenderId],
  })
}));

export const insertOutletBartenderSchema = createInsertSchema(outletBartender).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  name: true,
  contactNumber: true,
}).extend({
  bartenderName: z.string().min(1, "Bartender name is required").max(255).optional(),
  bartenderContactNumber: z.string().regex(/^\d{10}$/, "Contact number must be exactly 10 digits").optional(),
});

export const selectOutletBartenderSchema = createSelectSchema(outletBartender);