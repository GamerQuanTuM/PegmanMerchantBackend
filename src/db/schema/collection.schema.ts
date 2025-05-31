import { pgTable, varchar, uuid, timestamp, integer, date } from "drizzle-orm/pg-core";
import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { liquor } from "./liquor.schema";
import { tierEnum } from "./enums";
import { ticket } from "./ticket.schema";

export const collection = pgTable("collection", {
    id: uuid("id").defaultRandom().primaryKey(),
    type: tierEnum("tier").notNull(),
    pegsPerDay: integer("pegs_per_day").notNull(),
    labelOne: varchar("label_one", { length: 255 }),
    labelTwo: varchar("label_two", { length: 255 }),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    bookingPrice: integer("booking_price").notNull(),
    createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow().$onUpdateFn(() => new Date()),
})

export const collectionRelations = relations(collection, ({ many }) => ({
    liquors: many(liquor),
    tickets: many(ticket),
}))

export const selectOutletCollectionSchema = createSelectSchema(collection)

const dateRegex = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/;

export const insertCollectionSchema = createInsertSchema(collection)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    type: z.enum(tierEnum.enumValues),
    pegsPerDay: z.number().min(1, "Pegs per day is required"),
    labelOne: z.string().min(1, "Label one is required"),
    labelTwo: z.string().min(1, "Label two is required"),
    startDate: z.string().regex(dateRegex, "Start date must be in DD-MM-YYYY format"),
    endDate: z.string().regex(dateRegex, "End date must be in DD-MM-YYYY format"),
    bookingPrice: z.number().min(1, "Booking price is required"),
  })
  .refine((data) => {
    const [sd, sm, sy] = data.startDate.split("-").map(Number);
    const [ed, em, ey] = data.endDate.split("-").map(Number);
    const startDate = new Date(sy, sm - 1, sd);
    const endDate = new Date(ey, em - 1, ed);
    return startDate <= endDate;
  }, {
    message: "End date must be after start date",
    path: ["endDate"],
  });