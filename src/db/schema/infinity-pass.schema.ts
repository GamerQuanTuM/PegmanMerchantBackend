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
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
    specialOffer: z.string().min(1, "Special offer is required").max(255).optional(),
    cuisine: z.string().min(1, "Cuisine is required").max(255).optional(),
    liquorType: z.string().min(1, "Liquor type is required").max(255).optional(),
    days: z.array(z.string()).min(1, "Days is required"),
    price: z.string().min(1, "Price is required"),
    commission: z.string().min(1, "Commission is required"),
}).refine((data) => {
    return data.endTime > data.startTime;
}, {
    message: "End time must be after start time",
    path: ["endTime"],
})