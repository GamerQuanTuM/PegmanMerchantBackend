import { relations } from "drizzle-orm";
import { pgTable, uuid, text,timestamp } from "drizzle-orm/pg-core";
import { outletImages } from "./outlet-image.schema";

export const imageMetadata = pgTable("image_metadata", {
    id: uuid("id").primaryKey().defaultRandom(),
    imageS3Links: text("image_s3_links"),
    fileName: text("file_name"),
    uploadTimestamp: text("upload_timestamp"),
    createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow().$onUpdateFn(() => new Date()),
});

export const imageMetadataRelations = relations(imageMetadata, ({ one }) => ({
    outletImages: one(outletImages, {
        fields: [imageMetadata.id],
        references: [outletImages.id],
    }),
}));