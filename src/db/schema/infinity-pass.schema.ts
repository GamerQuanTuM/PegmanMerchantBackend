import { pgTable, varchar, uuid, timestamp, integer, time } from "drizzle-orm/pg-core";
import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { dayOfWeekEnum } from "./enums";

export const infinityPass = pgTable("infinity_pass", {
    id: uuid("id").primaryKey().defaultRandom(),
    startTime: time("start_time").notNull(),
    endTime: time("end_time").notNull(),
    specialOffer: varchar("special_offer", { length: 255 }),
    cuisine: varchar("cuisine", { length: 255 }),
    liquorType: varchar("liquor_type", { length: 255 }),
    days: dayOfWeekEnum("days").array().notNull(),
    price: integer("price").notNull(),
    commission: integer("commission").notNull().default(300),
    createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow().$onUpdateFn(() => new Date()),
})

export const selectInfinityPassSchema = createSelectSchema(infinityPass)

export const insertInfinityPassSchema = createInsertSchema(infinityPass).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
}).extend({
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
    specialOffer: z.string().min(1, "Special offer is required").max(255).optional(),
    cuisine: z.string().min(1, "Cuisine is required").max(255).optional(),
    liquorType: z.string().min(1, "Liquor type is required").max(255).optional(),
    days: z.array(z.enum(dayOfWeekEnum.enumValues)),
    price: z.number().min(1, "Price is required"),
    commission: z.number().min(1, "Commission is required"),
}).refine((data) => {
    const startTime = data.startTime.split(':').map(Number);
    const endTime = data.endTime.split(':').map(Number);
    const startMinutes = startTime[0] * 60 + startTime[1];
    const endMinutes = endTime[0] * 60 + endTime[1];
    return endMinutes > startMinutes;
}, {
    message: "End time must be after start time",
    path: ["endTime"],
})

export const infinityPassResponseSchema = z.object({
    message: z.string(),
    data: selectInfinityPassSchema
})