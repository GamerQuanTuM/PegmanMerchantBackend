import { pgTable, uuid, text,timestamp } from "drizzle-orm/pg-core";

import { relations } from "drizzle-orm";
import { outlet } from "./outlet.schema";

export const legalDocuments = pgTable("legal_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  fssaiNumber: text("fssai_number"),
  fssaiCertS3Link: text("fssai_cert_s3_link"),
  onshopLicenseS3Link: text("onshop_license_s3_link"),
  offshopLicenseS3Link: text("offshop_license_s3_link"),
  panCardS3Link: text("pan_card_s3_link"),
  gstNumber: text("gst_number"),
  accountNumber: text("account_number"),
  accountType: text("account_type"),
  ifscCode: text("ifsc_code"),
  cancelledChequeS3Link: text("cancelled_cheque_s3_link"),
  createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow().$onUpdateFn(() => new Date()),
});

export const legalDocumentsRelations = relations(legalDocuments, ({ one }) => ({
  outlet: one(outlet, {
    fields: [legalDocuments.id],
    references: [outlet.legalDocumentsId],
  }),
}));
