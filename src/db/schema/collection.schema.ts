import { pgTable, varchar, uuid, timestamp, integer, date } from "drizzle-orm/pg-core";
import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { liquor } from "./liquor.schema";
import { passTypeEnum } from "./enums";

export const collection = pgTable("collection", {
    id: uuid("id").defaultRandom().primaryKey(),
    type: passTypeEnum("type").notNull(),
    pegsPerDay: integer("pegs_per_day").notNull(),
    labelOne: varchar("label_one", { length: 255 }),
    labelTwo: varchar("label_two", { length: 255 }),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow().$onUpdateFn(() => new Date()),
})

export const collectionRelations = relations(collection, ({ many }) => ({
    liquors: many(liquor),
}))