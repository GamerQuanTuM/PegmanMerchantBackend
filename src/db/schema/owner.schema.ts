import { relations } from "drizzle-orm";
import { pgTable, varchar, uuid, integer, timestamp } from "drizzle-orm/pg-core";
import { outlet } from "./outlet.schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const owner = pgTable("owner", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name"),
    email: varchar("email"),
    isdCode: integer("isd_code"),
    mobileNumber: varchar("mobile_number", { length: 10 }).notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow().$onUpdateFn(() => new Date()),
});

export const ownerRelations = relations(owner, ({ many }) => ({
    outlets: many(outlet),
}));

export type Owner = typeof owner.$inferSelect;

const baseOwnerSchema = createSelectSchema(owner).pick({
    mobileNumber: true,
    isdCode: true,
});

export const selectOwnerSchema = baseOwnerSchema.extend({
    otp: z.string(),
});

export const ownerResponseSchema = z.object({
    message: z.string(),
    data: baseOwnerSchema
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