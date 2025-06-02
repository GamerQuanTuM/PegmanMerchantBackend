import { pgTable, varchar, uuid, timestamp, integer, date } from "drizzle-orm/pg-core";
import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { liquor } from "./liquor.schema";
import { tierEnum } from "./enums";
import { ticket } from "./ticket.schema";
import { outlet } from "./outlet.schema";

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

export const collectionRelations = relations(collection, ({ many, one }) => ({
  liquors: many(liquor),
  tickets: many(ticket),
  goldOutlet: one(outlet, {
    fields: [collection.id],
    references: [outlet.goldCollectionId],
  }),
  silverOutlet: one(outlet, {
    fields: [collection.id],
    references: [outlet.silverCollectionId],
  }),
  crystalOutlet: one(outlet, {
    fields: [collection.id],
    references: [outlet.crystalCollectionId],
  })
}))

export const selectOutletCollectionSchema = createSelectSchema(collection)

const dateRegex = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/;

export const insertCollectionSchema = createInsertSchema(collection, {
  type: z.enum(tierEnum.enumValues),
  pegsPerDay: z.number().min(1, "Pegs per day is required"),
  labelOne: z.string().min(1, "Label one is required"),
  labelTwo: z.string().min(1, "Label two is required"),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format"),
  bookingPrice: z.number().min(1, "Booking price is required"),
})
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .refine((data) => {
    const [sy, sm, sd] = data.startDate.split("-").map(Number);
    const [ey, em, ed] = data.endDate.split("-").map(Number);
    const startDate = new Date(sy, sm - 1, sd);
    const endDate = new Date(ey, em - 1, ed);
    return startDate <= endDate;
  }, {
    message: "End date must be after start date",
    path: ["endDate"],
  });

// GOLD:3d41e93b-4a06-48a8-827c-5ecdf9ed6477
// SILVER:8a1cde45-167b-4356-b2e0-9d035dbc315f
// CRYSTAL:68f98243-254c-4e0a-8bdc-0319dde20f61