import { pgTable, boolean, varchar, uuid, text,timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { contactInfo } from "./contact-info.schema";

export const manager = pgTable("manager", {
    id: uuid("id").primaryKey().defaultRandom(),
    sameAsRestaurantPhoneNumber: boolean("same_as_restaurant_phone_number"),
    contactInfoId: uuid("contact_info_id").references(() => contactInfo.id),
    name: varchar("name", { length: 30 }).notNull(),
    emailAddress: text("email_address").notNull(),
    isEmailVerified: boolean("is_email_verified").notNull(),
    createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow().$onUpdateFn(() => new Date()),
});

export const managerRelations = relations(manager, ({ one }) => ({
    contactInfo: one(contactInfo, {
        fields: [manager.contactInfoId],
        references: [contactInfo.id],
    }),
}));