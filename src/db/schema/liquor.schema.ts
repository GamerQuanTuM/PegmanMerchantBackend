import { pgTable, varchar, uuid, timestamp, integer } from "drizzle-orm/pg-core";
import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { collection } from "./collection.schema";
import { relations } from "drizzle-orm";

export const liquor = pgTable("liquor", {
  id: uuid("id").defaultRandom().primaryKey(),
  collectionId: uuid("collection_id").references(() => collection.id).notNull(),
  name: varchar("name", { length: 256 }).notNull(),
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