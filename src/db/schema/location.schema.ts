import { pgTable, doublePrecision, uuid,timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { outletPrimaryDetails } from "./outlet-primary-details.schema";

export const location = pgTable("location", {
  id: uuid("id").primaryKey().defaultRandom(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow().$onUpdateFn(() => new Date()),
});

export const locationRelations = relations(location, ({ one }) => ({
  outletPrimaryDetails: one(outletPrimaryDetails, {
    fields: [location.id],
    references: [outletPrimaryDetails.locationId],
  }),
}));