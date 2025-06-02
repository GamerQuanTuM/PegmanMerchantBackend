import { relations } from "drizzle-orm";
import { pgTable, varchar, uuid, integer, timestamp } from "drizzle-orm/pg-core";

import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { outlet } from "./outlet.schema";

export const owner = pgTable("owner", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name"),
    email: varchar("email"),
    mobileNumber: varchar("mobile_number", { length: 10 }).notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow().$onUpdateFn(() => new Date()),
});

export const ownerRelations = relations(owner, ({ many }) => ({
    outlets: many(outlet),
}));

export type Owner = typeof owner.$inferSelect;

export const selectOwnerSchema = createSelectSchema(owner)

export const ownerOtpSchema = selectOwnerSchema.pick({
    mobileNumber: true,
});

export const selectOtpSchema = ownerOtpSchema.extend({
    otp: z.string(),
});

export const ownerResponseSchema = z.object({
    message: z.string(),
    data: ownerOtpSchema
})

export const updateOwnerSchema = createSelectSchema(owner).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
}).partial();

export const updateOwnerResponseSchema = z.object({
    message: z.string(),
    data: updateOwnerSchema
})

