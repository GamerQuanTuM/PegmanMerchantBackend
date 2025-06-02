import { pgTable, varchar, uuid, timestamp, text } from "drizzle-orm/pg-core";
import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { accountTypeEnum } from "./enums";
import { outlet } from "./outlet.schema";
import { relations } from "drizzle-orm";

export const outletLegalDocument = pgTable("outlet_legal_document", {
  id: uuid("id").primaryKey().defaultRandom(),
  fssaiNumber: varchar("fssai_number", { length: 14 }),
  fssaiUrl: text("fssai_url"),
  onShopLicenseUrl: text("on_shop_license_url"),
  offShopLicenseUrl: text("off_shop_license_url"),
  panCardNumber: varchar("pan_card_number", { length: 10 }),
  panCardUrl: text("pan_card_url"),
  gstNumber: varchar("gst_number", { length: 15 }),
  bankAccountNumber: varchar("bank_account_number", { length: 30 }),
  bankAccountType: accountTypeEnum("bank_account_type"),
  bankIfscCode: varchar("bank_ifsc_code", { length: 11 }),
  createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow().$onUpdateFn(() => new Date()),
});

export const outletLegalDocumentRelations = relations(outletLegalDocument, ({ one }) => ({
  outlet: one(outlet, {
    fields: [outletLegalDocument.id],
    references: [outlet.legalDocumentId],
  }),
}));

export const insertOutletLegalDocumentSchema = createInsertSchema(outletLegalDocument, {
  fssaiNumber: z.string().regex(/^\d{14}$/, "FSSAI number must be exactly 14 digits"),
  panCardNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN card format").optional(),
  gstNumber: z.string().regex(/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/, "Invalid GST number format"),
  bankAccountNumber: z.string().min(9, "Bank account number too short").max(30, "Bank account number too long").optional(),
  bankIfscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code format").optional(),
  bankAccountType: z.enum(accountTypeEnum.enumValues),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  fssaiUrl: true,
  onShopLicenseUrl: true,
  offShopLicenseUrl: true,
  panCardUrl: true,
}).extend({
  fssaiImage: z.any(),
  onShopLicenseImage: z.any(),
  offShopLicenseImage: z.any().optional(),
  panCardImage: z.any(),
})

export const selectOutletLegalDocumentsSchema = createSelectSchema(outletLegalDocument);

export const outletLegalDocumentsResponseSchema = z.object({
  message: z.string(),
  data: selectOutletLegalDocumentsSchema,
});