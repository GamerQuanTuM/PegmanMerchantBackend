// outlet.schema.ts (Main table with all relations)
import { relations } from "drizzle-orm";
import { pgTable, uuid, timestamp, varchar, boolean } from "drizzle-orm/pg-core";
import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { insertOutletsDetailsSchema, outletsDetails } from "./outlet-details.schema";
import { insertOutletLegalDocumentSchema, outletLegalDocument } from "./outlet_legal_document.schema";
import { insertOutletManagerSchema, outletManager } from "./outlet-manager.schema";
import { insertOutletTimingSchema, outletTiming } from "./outlet-timing.schema";
import { insertOutletBartenderSchema, outletBartender } from "./outlet-bartender.schema";
import { owner } from "./owner.schema";

export const outlet = pgTable("outlet", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }),
    ownerId: uuid("owner_id").references(() => owner.id),
    isVerified: boolean().default(false),
    detailsId: uuid("details_id").references(() => outletsDetails.id),
    legalDocumentId: uuid("legal_document_id").references(() => outletLegalDocument.id),
    managerId: uuid("manager_id").references(() => outletManager.id),
    timingId: uuid("timing_id").references(() => outletTiming.id),
    bartenderId: uuid("bartender_id").references(() => outletBartender.id),
    createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow().$onUpdateFn(() => new Date()),
});

export const outletRelations = relations(outlet, ({ one }) => ({
    details: one(outletsDetails, {
        fields: [outlet.detailsId],
        references: [outletsDetails.id],
    }),
    legalDocument: one(outletLegalDocument, {
        fields: [outlet.legalDocumentId],
        references: [outletLegalDocument.id],
    }),
    manager: one(outletManager, {
        fields: [outlet.managerId],
        references: [outletManager.id],
    }),
    timing: one(outletTiming, {
        fields: [outlet.timingId],
        references: [outletTiming.id],
    }),
    bartender: one(outletBartender, {
        fields: [outlet.bartenderId],
        references: [outletBartender.id],
    }),
    owner: one(owner, {
        fields: [outlet.ownerId],
        references: [owner.id],
    })
}));

export const insertOutletSchema = createInsertSchema(outlet, {
    name: z.string().min(1, "Outlet name is required").max(255),
    isVerified: z.boolean().default(false),
})
    .omit({
        id: true,
        createdAt: true,
        updatedAt: true,
        isVerified: true,
    })

export const outletCreationSchema = z.object({
    outlet: insertOutletSchema.omit({
        detailsId: true,
        legalDocumentId: true,
        managerId: true,
        timingId: true,
        bartenderId: true,
    }),
    details: insertOutletsDetailsSchema,
    legalDocument: insertOutletLegalDocumentSchema,
    manager: insertOutletManagerSchema,
    timing: insertOutletTimingSchema,
    bartender: insertOutletBartenderSchema.optional(),
}).extend({
    outletImages: z
        .array(z.any())
        .min(1, "At least one outlet image is required")
        .max(2, "You can upload a maximum of 2 images"),
    fssaiImages: z.any(),
    panCardImages: z.any(),
    onShopLicenseImages: z.any(),
    offShopLicenseImages: z.any().optional(),
});

export const outletResponseSchema = z.object({
    message: z.string(),
    data: createSelectSchema(outlet),
});

export type Outlet = typeof outlet.$inferSelect;
export type InsertOutlet = typeof outlet.$inferInsert;
export type OutletCreation = z.infer<typeof outletCreationSchema>;