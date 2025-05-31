import { pgTable, uuid, timestamp, time } from "drizzle-orm/pg-core";
import { dayOfWeekEnum } from "./enums"
import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { outletTiming } from "./outlet-timing.schema";

export const outletTimingSlot = pgTable("outlet_timing_slot", {
    id: uuid("id").primaryKey().defaultRandom(),
    outletTimingId: uuid("outlet_timing_id").references(() => outletTiming.id),
    day: dayOfWeekEnum("day"),
    openingTime: time('opening_time'),
    closingTime: time('closing_time'),
    createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow().$onUpdateFn(() => new Date()),
})

export const outletTimingSlotRelation = relations(outletTimingSlot, ({ one }) => ({
    outlet_timing: one(outletTiming, {
      fields: [outletTimingSlot.outletTimingId],
      references: [outletTiming.id],
    }),
  }));

export const insertOutletTimingSlotSchema = createInsertSchema(outletTimingSlot, {
    day: z.enum(dayOfWeekEnum.enumValues),
    openingTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
    closingTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
}).omit({
    id: true,
    outletTimingId: true,
    createdAt: true,
    updatedAt: true,
}).refine((data) => {
    // Validate that closing time is after opening time for weekdays
    const openTime = data.openingTime.split(':').map(Number);
    const closeTime = data.closingTime.split(':').map(Number);
    const openMinutes = openTime[0] * 60 + openTime[1];
    const closeMinutes = closeTime[0] * 60 + closeTime[1];
    return closeMinutes > openMinutes;
}, {
    message: "Closing time must be after opening time",
    path: ["closingTime"],
})

export const selectOutletTimingSlotSchema = createSelectSchema(outletTimingSlot)

export const updateOutletTimingSlotSchema = z.object({
    day: z.enum(dayOfWeekEnum.enumValues).optional(),
    openingTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)").optional(),
    closingTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)").optional(),
}).refine((data) => {
    if (!data.openingTime || !data.closingTime) return true;
    const openTime = data.openingTime.split(':').map(Number);
    const closeTime = data.closingTime.split(':').map(Number);
    const openMinutes = openTime[0] * 60 + openTime[1];
    const closeMinutes = closeTime[0] * 60 + closeTime[1];
    return closeMinutes > openMinutes;
}, {
    message: "Closing time must be after opening time",
    path: ["closingTime"],
});

export const outletTimingSlotResponseSchema = z.object({
    message: z.string(),
    data: selectOutletTimingSlotSchema
})