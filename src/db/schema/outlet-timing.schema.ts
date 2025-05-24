import { pgTable, uuid, timestamp, boolean, time } from "drizzle-orm/pg-core";
import { establishmentTypeEnum } from "./enums";
import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const outletTiming = pgTable("outlet_timing", {
    id: uuid("id").primaryKey().defaultRandom(),
    establishmentType: establishmentTypeEnum("establishment_type"),
    hotelStay: boolean("hotel_stay").default(false),
    eventSpace: boolean("event_space").default(false),
    weekDayOpeningTime: time('week_day_opening_time'),
    weekDayClosingTime: time('week_day_closing_time'),
    weekendOpeningTime: time('weekend_opening_time'),
    weekendClosingTime: time('weekend_closing_time'),
    createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow().$onUpdateFn(() => new Date()),
});


export const insertOutletTimingSchema = createInsertSchema(outletTiming, {
    hotelStay: z.boolean().optional(),
    eventSpace: z.boolean().optional(),
    weekDayOpeningTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
    weekDayClosingTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
    weekendOpeningTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
    weekendClosingTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  }).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  }).refine((data) => {
    // Validate that closing time is after opening time for weekdays
    const openTime = data.weekDayOpeningTime.split(':').map(Number);
    const closeTime = data.weekDayClosingTime.split(':').map(Number);
    const openMinutes = openTime[0] * 60 + openTime[1];
    const closeMinutes = closeTime[0] * 60 + closeTime[1];
    return closeMinutes > openMinutes;
  }, {
    message: "Weekday closing time must be after opening time",
    path: ["weekDayClosingTime"],
  }).refine((data) => {
    // Validate that closing time is after opening time for weekends
    const openTime = data.weekendOpeningTime.split(':').map(Number);
    const closeTime = data.weekendClosingTime.split(':').map(Number);
    const openMinutes = openTime[0] * 60 + openTime[1];
    const closeMinutes = closeTime[0] * 60 + closeTime[1];
    return closeMinutes > openMinutes;
  }, {
    message: "Weekend closing time must be after opening time",
    path: ["weekendClosingTime"],
  });

export const selectOutletTimingSchema = createSelectSchema(outletTiming);

export const outletTimingResponseSchema = z.object({
    message: z.string(),
    data: selectOutletTimingSchema,
});