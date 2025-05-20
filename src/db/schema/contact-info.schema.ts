import { pgTable, boolean, uuid, integer, varchar,timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { manager } from "./manager.schema";

export const contactInfo = pgTable("contact_info", {
  id: uuid("id").primaryKey().defaultRandom(),
  isdCode: integer("isd_code").notNull(),
  mobileNumber: varchar("mobile_number", { length: 10 }).notNull(),
  isMobileNumberVerified: boolean("is_mobile_number_verified"),
  landlineNumber: varchar("landline_number", { length: 8 }),
  createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow().$onUpdateFn(() => new Date()),
});

export const contactInfoRelations = relations(contactInfo, ({ one }) => ({
  manager: one(manager, {
    fields: [contactInfo.id],
    references: [manager.contactInfoId],
  }),
}));