import { relations } from "drizzle-orm";
import { pgTable, uuid, timestamp, boolean } from "drizzle-orm/pg-core";
import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { owner } from "./owner.schema";
import { outletsDetails, selectOutletsDetailsSchema } from "./outlet-details.schema";
import { outletLegalDocument, selectOutletLegalDocumentsSchema } from "./outlet-legal-document.schema";
import { outletManager, selectOutletManagerSchema } from "./outlet-manager.schema";
import { outletTiming, selectOutletTimingSchema } from "./outlet-timing.schema";
import { outletBartender, selectOutletBartenderSchema } from "./outlet-bartender.schema";
import { selectOutletTimingSlotSchema } from "./outlet-timing-slot.schema";
import { collection } from "./collection.schema";
import { infinityPass } from "./infinity-pass.schema";

export const outlet = pgTable("outlet", {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: uuid("owner_id").references(() => owner.id),
    isVerified: boolean("is_verified").default(false),
    detailsId: uuid("details_id").references(() => outletsDetails.id),
    legalDocumentId: uuid("legal_document_id").references(() => outletLegalDocument.id),
    managerId: uuid("manager_id").references(() => outletManager.id),
    timingId: uuid("timing_id").references(() => outletTiming.id),
    bartenderId: uuid("bartender_id").references(() => outletBartender.id),
    goldCollectionId: uuid("gold_collection_id").references(() => collection.id),
    silverCollectionId: uuid("silver_collection_id").references(() => collection.id),
    crystalCollectionId: uuid("crystal_collection_id").references(() => collection.id),
    infinityPassId: uuid("infinity_pass_id").references(() => infinityPass.id),
    createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow().$onUpdateFn(() => new Date()),
});
// Doing these is a workaround to avoid circular dependency.
const ownerSchema = z.object({
    id: z.string(),
    name: z.string().nullable(),
    email: z.string().nullable(),
    mobileNumber: z.string(),
    createdAt: z.date().nullable(),
    updatedAt: z.date().nullable(),
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
    }),
    goldCollection: one(collection, {
        fields: [outlet.goldCollectionId],
        references: [collection.id],
        relationName: "gold_collection",
    }),
    silverCollection: one(collection, {
        fields: [outlet.silverCollectionId],
        references: [collection.id],
        relationName: "silver_collection",
    }),
    crystalCollection: one(collection, {
        fields: [outlet.crystalCollectionId],
        references: [collection.id],
        relationName: "crystal_collection",
    }),
    infinityPass: one(infinityPass, {
        fields: [outlet.infinityPassId],
        references: [infinityPass.id],
    }),
}));

export const insertOutletSchema = createInsertSchema(outlet, {
    ownerId: z.string().uuid(),
    detailsId: z.string().uuid(),
    legalDocumentId: z.string().uuid(),
    managerId: z.string().uuid(),
    timingId: z.string().uuid(),
    bartenderId: z.string().uuid().optional(),
})
    .omit({
        id: true,
        createdAt: true,
        updatedAt: true,
        isVerified: true,
        goldCollectionId: true,
        silverCollectionId: true,
        crystalCollectionId: true,
        infinityPassId: true,
    })

export const selectOutletSchema = createSelectSchema(outlet)

export const selectOutletTimingWithSlotsSchema = selectOutletTimingSchema.extend({
    slots: z.array(selectOutletTimingSlotSchema).nullable(),
});




export const selectOutletSchemaWithRelations = selectOutletSchema.omit({
    ownerId: true,
    detailsId: true,
    legalDocumentId: true,
    managerId: true,
    timingId: true,
    bartenderId: true,
    goldCollectionId: true,
    silverCollectionId: true,
    crystalCollectionId: true,
    infinityPassId: true
}).extend({
    owner: ownerSchema.nullable(),
    details: selectOutletsDetailsSchema.nullable(),
    legalDocument: selectOutletLegalDocumentsSchema.nullable(),
    manager: selectOutletManagerSchema.nullable(),
    bartender: selectOutletBartenderSchema.nullable(),
    timing: selectOutletTimingWithSlotsSchema.nullable(),
})



export const outletResponseSchemaWithRelations = z.object({
    message: z.string(),
    data: selectOutletSchemaWithRelations,
});

export const outletResponseSchema = z.object({
    message: z.string(),
    data: selectOutletSchema,
});

export const updateVerifyOutletSchema = selectOutletSchema.pick({
    isVerified: true,
})


