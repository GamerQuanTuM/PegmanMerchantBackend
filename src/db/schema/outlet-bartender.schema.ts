import { pgTable, varchar, uuid, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";

export const outletBartender = pgTable("outlet_bartender", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }),
    contactNumber: varchar("contact_number", { length: 10 }),
    createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow().$onUpdateFn(() => new Date()),
});

export const insertOutletBartenderSchema = createInsertSchema(outletBartender, {
    name: z.string().min(1, "Bartender name is required").max(255),
    contactNumber: z.string().regex(/^\d{10}$/, "Contact number must be exactly 10 digits"),
  }).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  });

