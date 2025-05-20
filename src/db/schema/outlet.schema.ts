import { pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { owner } from "./owner.schema";
import { relations } from "drizzle-orm";
import { outletPrimaryDetails } from "./outlet-primary-details.schema";
import { outletTimings } from "./outlet-timings.schema";
import { outletImages } from "./outlet-image.schema";
import { legalDocuments } from "./legal-documents.schema";

export const outlet = pgTable("outlet", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: uuid("owner_id").references(() => owner.id),
  outletPrimaryDetailsId: uuid("outlet_primary_details_id")
    .references(() => outletPrimaryDetails.id),
  outletTimingsId: uuid("outlet_timings_id")
    .references(() => outletTimings.id),
  outletImagesId: uuid("outlet_images_id")
    .references(() => outletImages.id),
  legalDocumentsId: uuid("legal_documents_id")
    .notNull()
    .references(() => legalDocuments.id),
  createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: false })
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});

export const outletRelations = relations(outlet, ({ one }) => ({
  owner: one(owner, {
    fields: [outlet.ownerId],
    references: [owner.id],
  }),
  primaryDetails: one(outletPrimaryDetails, {
    fields: [outlet.outletPrimaryDetailsId],
    references: [outletPrimaryDetails.id],
  }),
  timings: one(outletTimings, {
    fields: [outlet.outletTimingsId],
    references: [outletTimings.id],
  }),
  images: one(outletImages, {
    fields: [outlet.outletImagesId],
    references: [outletImages.id],
  }),
  legalDocuments: one(legalDocuments, {
    fields: [outlet.legalDocumentsId],
    references: [legalDocuments.id],
  }),
}));