import { timestamp, uuid, pgTable, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "@hono/zod-openapi";
import { roleEnum } from "./enums"


export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password: varchar("password", { length: 255 }).notNull(),
    role: roleEnum("role").notNull(),
    createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow().$onUpdateFn(() => new Date()),
});

export const selectUserSchema = createSelectSchema(users).omit({
    password: true,
})

export const insertUserSchema = createInsertSchema(users, {
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(["SUPER_ADMIN",
        "ADMIN",
        "MANAGER",
        "USER"]),
})
    .required({
        email: true,
        password: true,
        role: true,
    })
    .omit({
        id: true,
        createdAt: true,
        updatedAt: true,
    })

export const updateUserSchema = insertUserSchema.partial();
export const loginUserSchema = insertUserSchema.pick({
    email: true,
    password: true,
})
export const userResponseSchema = z.object({
    message: z.string(),
    data: selectUserSchema
});


export type User = typeof users.$inferSelect;
export type UserWithoutPassword = Omit<User, "password">