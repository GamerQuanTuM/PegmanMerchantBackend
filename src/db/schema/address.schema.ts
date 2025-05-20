import { pgTable, text, uuid, varchar,timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { outletPrimaryDetails } from "./outlet-primary-details.schema";

export const address = pgTable("address", {
  id: uuid("id").primaryKey().defaultRandom(),
  street: text("street"),
  city: varchar("city", { length: 20 }),
  state: varchar("state", { length: 20 }),
  zipCode: varchar("zip_code", { length: 6 }),
  country: varchar("country", { length: 20 }),
  createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow().$onUpdateFn(() => new Date()),
});


export const addressRelations = relations(address, ({ one }) => ({
  outletPrimaryDetails: one(outletPrimaryDetails, {
    fields: [address.id],
    references: [outletPrimaryDetails.addressId],
  }),
}));