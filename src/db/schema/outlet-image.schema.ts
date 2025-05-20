import { pgTable, uuid, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { imageMetadata } from "./image-metadata.schema";

export const outletImages = pgTable("outlet_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  imageMetadataId: uuid("image_metadata_id").references(() => imageMetadata.id),
  createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow().$onUpdateFn(() => new Date()),
});

export const outletImagesRelations = relations(outletImages, ({ many }) => ({
  imageMetadata: many(imageMetadata),
}));