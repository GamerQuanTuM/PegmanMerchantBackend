import { pgTable, text, uuid,timestamp } from "drizzle-orm/pg-core";

export const timeSlot = pgTable("time_slot", {
  id: uuid("id").primaryKey().defaultRandom(),
  opensAt: text("opens_at"),
  closesAt: text("closes_at"),
  createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow().$onUpdateFn(() => new Date()),
});

// If timeSlot should be related to outletTimings, add the relation below. Adjust as needed.
// import { relations } from "drizzle-orm";
// import { outletTimings } from "./outlet-timings.schema";
//
// export const timeSlotRelations = relations(timeSlot, ({ one }) => ({
//   outletTimings: one(outletTimings, {
//     fields: [timeSlot.id],
//     references: [outletTimings.id],
//   }),
// }));