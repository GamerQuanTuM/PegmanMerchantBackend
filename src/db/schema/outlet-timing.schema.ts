import { pgTable, uuid, timestamp, boolean, time } from "drizzle-orm/pg-core";
import { establishmentTypeEnum } from "./enums";
import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { insertOutletTimingSlotSchema, outletTimingSlot, selectOutletTimingSlotSchema } from "./outlet-timing-slot.schema";
import { outlet } from "./outlet.schema";

export const outletTiming = pgTable("outlet_timing", {
  id: uuid("id").primaryKey().defaultRandom(),
  establishmentType: establishmentTypeEnum("establishment_type"),
  hotelStay: boolean("hotel_stay").default(false),
  eventSpace: boolean("event_space").default(false),
  createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow().$onUpdateFn(() => new Date()),
});

export const outletTimingRelation = relations(outletTiming, ({ many, one }) => ({
  slots: many(outletTimingSlot),
  outlet: one(outlet, {
    fields: [outletTiming.id],
    references: [outlet.timingId],
  }),
}));

export const insertOutletTimingSchema = createInsertSchema(outletTiming, {
  hotelStay: z.boolean().optional(),
  eventSpace: z.boolean().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export const insertOutletTimingSchemaWithSlot = z.object({
  ...insertOutletTimingSchema.shape,
  slots: insertOutletTimingSlotSchema.array(),
});

export const selectOutletTimingSchema = createSelectSchema(outletTiming);

export const outletTimingResponseSchema = z.object({
  message: z.string(),
  data: selectOutletTimingSchema.extend({
    slots: z.array(selectOutletTimingSlotSchema),
  }),
});