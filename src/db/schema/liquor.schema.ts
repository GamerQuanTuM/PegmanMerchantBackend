import { pgTable, varchar, uuid, timestamp, integer } from "drizzle-orm/pg-core";
import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { collection } from "./collection.schema";

export const liquor = pgTable("liquor", {
  id: uuid("id").defaultRandom().primaryKey(),
  collectionId: uuid("collection_id").references(() => collection.id).notNull(),
  category: varchar("category", { length: 256 }).notNull(),
  startingPrice: integer("starting_price").notNull(),
  brandNames: varchar("brand_names", { length: 256 }).array().notNull(),
  createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow().$onUpdateFn(() => new Date()),
})

export const liquorRelations = relations(liquor, ({ one }) => ({
    collection: one(collection, {
        fields: [liquor.collectionId],
        references: [collection.id],
    })
}))

export const insertLiquorSchema = createInsertSchema(liquor, {
  collectionId: z.string().uuid(),
  category: z.string().min(1, "Liquor name is required").max(256),
  startingPrice: z.number().min(1, "Starting price is required"),
  brandNames: z.string().array().min(1, "Brand names is required"),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export const selectLiquorSchema = createSelectSchema(liquor)