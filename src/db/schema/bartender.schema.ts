import { pgTable, varchar, uuid, integer,timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { outletPrimaryDetails } from "./outlet-primary-details.schema";

export const bartender = pgTable("bartender", {
    id: uuid("id").primaryKey().defaultRandom(),
    isdCode: integer("isd_code"),
    mobileNumber: varchar("mobile_number", { length: 10 }),
    name: varchar("name", { length: 20 }),
    createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow().$onUpdateFn(() => new Date()),
});



export const bartenderRelations = relations(bartender, ({ one }) => ({
    outletPrimaryDetails: one(outletPrimaryDetails, {
        fields: [bartender.id],
        references: [outletPrimaryDetails.bartenderId],
    }),
}));