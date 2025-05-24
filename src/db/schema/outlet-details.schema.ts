import { pgTable, varchar, uuid, timestamp, text, doublePrecision } from "drizzle-orm/pg-core";
import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { insertOutletBartenderSchema, selectOutletBartenderSchema } from "./outlet-bartender.schema";
import { insertOutletManagerSchema, selectOutletManagerSchema } from "./outlet-manager.schema";

export const outletsDetails = pgTable("outlet_details", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }),
  address: text("address"),
  contactNumber: varchar("contact_number", { length: 10 }),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  country: varchar("country", { length: 100 }),
  pincode: varchar("pincode", { length: 6 }),
  outlet_image_url: text('s3_urls').array(),
  createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow().$onUpdateFn(() => new Date()),
});

export const insertOutletsDetailsSchema = createInsertSchema(outletsDetails, {
  name: z.string().min(1, "Name is required").max(255),
  address: z.string().min(1, "Address is required"),
  contactNumber: z.string().regex(/^\d{10}$/, "Contact number must be exactly 10 digits"),
  latitude: z.union([z.string(), z.number()])
    .transform((val) => typeof val === "string" ? parseFloat(val) : val)
    .refine((val) => !isNaN(val) && val >= -90 && val <= 90, {
      message: "Invalid latitude",
    }),
  longitude: z.union([z.string(), z.number()])
    .transform((val) => typeof val === "string" ? parseFloat(val) : val)
    .refine((val) => !isNaN(val) && val >= -180 && val <= 180, {
      message: "Invalid longitude",
    }),
  country: z.string().min(1, "Country is required").max(100),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be exactly 6 digits"),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  outlet_image_url: true,
}).extend({
  outlet_images: z.any().optional(),
});

export const selectOutletsDetailsSchema = createSelectSchema(outletsDetails);

// Fix: Create a proper combined schema
export const fullOutletDetailsInsertSchema = insertOutletsDetailsSchema
  .merge(insertOutletBartenderSchema)
  .merge(insertOutletManagerSchema.partial());

// Fix: Create a proper response schema
export const outletsDetailsResponseSchema = z.object({
  message: z.string(),
  data: z.object({
    details: selectOutletsDetailsSchema,
    manager: selectOutletManagerSchema,
    bartender: selectOutletBartenderSchema.optional()
  })
});

