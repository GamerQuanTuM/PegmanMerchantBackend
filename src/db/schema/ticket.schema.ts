
import { pgTable, uuid, timestamp, varchar, integer, boolean, date } from "drizzle-orm/pg-core";
import { users } from "./user.schema";
import { collection } from "./collection.schema";
import { relations } from "drizzle-orm";

export const ticket = pgTable("ticket", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    collectionId: uuid("collection_id").references(() => collection.id).notNull(),
    isExpired: boolean("is_expired").notNull().default(false),
    bookingDate: date("booking_date").notNull(),
    createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow().$onUpdateFn(() => new Date()),
});

export const ticketItem = pgTable("ticket_item", {
    id: uuid("id").defaultRandom().primaryKey(),
    ticketId: uuid("ticket_id").references(() => ticket.id).notNull(),
    category: varchar("category", { length: 100 }).notNull(),
    brandNames: varchar("brand_names", { length: 255 }).notNull(),
    pegs: integer("pegs").notNull(),
    createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow().$onUpdateFn(() => new Date()),
})

export const ticketRelations = relations(ticket, ({ one, many }) => ({
    user: one(users, { fields: [ticket.userId], references: [users.id] }),
    collection: one(collection, { fields: [ticket.collectionId], references: [collection.id] }),
    items: many(ticketItem),
}));

export const ticketItemRelations = relations(ticketItem, ({ one }) => ({
    ticket: one(ticket, { fields: [ticketItem.ticketId], references: [ticket.id] }),
}));