import { pgTable, boolean, uuid, text,timestamp } from "drizzle-orm/pg-core";
import { establishmentTypeEnum } from "./enums";
import { relations } from "drizzle-orm";
import { outlet } from "./outlet.schema";

export const outletTimings = pgTable("outlet_timings", {
    id: uuid("id").primaryKey().defaultRandom(),
    establishmentType: establishmentTypeEnum("establishment_type").default("RESTAURANT"),
    isHotelStay: boolean("is_hotel_stay"),
    isEventSpace: boolean("is_event_space"),
    weekdayOpenTime: text("weekday_open_time"),
    weekdayCloseTime: text("weekday_close_time"),
    weekendOpenSlot: text("weekend_open_slot"),
    weekendCloseSlot: text("weekend_close_slot"),
    createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow().$onUpdateFn(() => new Date()),
});


export const outletTimingsRelations = relations(outletTimings, ({ one }) => ({
    outlet: one(outlet, {
        fields: [outletTimings.id],
        references: [outlet.outletTimingsId],
    }),
}));