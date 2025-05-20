import { pgTable, varchar, timestamp, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { address } from "./address.schema";
import { contactInfo } from "./contact-info.schema";
import { location } from "./location.schema";
import { manager } from "./manager.schema";
import { bartender } from "./bartender.schema";

export const outletPrimaryDetails = pgTable("outlet_primary_details", {
    id: uuid("id").primaryKey().defaultRandom(),
    outletName: varchar("outlet_name", { length: 255 }),
    addressId: uuid("address_id").references(() => address.id),
    contactInfoId: uuid("contact_info_id").references(() => contactInfo.id),
    locationId: uuid("location_id").references(() => location.id),
    managerId: uuid("manager_id").references(() => manager.id),
    bartenderId: uuid("bartender_id").references(() => bartender.id),
    createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow().$onUpdateFn(() => new Date()),
});

export const outletPrimaryDetailsRelations = relations(outletPrimaryDetails, ({ one }) => ({
    address: one(address, {
        fields: [outletPrimaryDetails.addressId],
        references: [address.id],
    }),
    contactInfo: one(contactInfo, {
        fields: [outletPrimaryDetails.contactInfoId],
        references: [contactInfo.id],
    }),
    location: one(location, {
        fields: [outletPrimaryDetails.locationId],
        references: [location.id],
    }),
    manager: one(manager, {
        fields: [outletPrimaryDetails.managerId],
        references: [manager.id],
    }),
    bartender: one(bartender, {
        fields: [outletPrimaryDetails.bartenderId],
        references: [bartender.id],
    }),
}));