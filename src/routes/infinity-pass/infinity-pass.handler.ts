import * as HttpStatusCode from "stoker/http-status-codes"
import { AppRouteHandler } from "../../types";
import { CreateInfinityPassSchema, GetInfinityPassByIdSchema } from "./infinity-pass.route";
import { db } from "../../db";
import { infinityPass, outlet } from "../../db/schema";

export const createInfinityPass: AppRouteHandler<CreateInfinityPassSchema> = async (c) => {
    const { commission, days, endTime, price, startTime, cuisine, liquorType, specialOffer } = c.req.valid("json");
    const { id } = c.req.valid("param");

    if (startTime > endTime) {
        return c.json({
            message: "Start time cannot be greater than end time"
        }, HttpStatusCode.BAD_REQUEST)
    }

    if (days.length > 7) {
        return c.json({
            message: "Days cannot be greater than 7"
        }, HttpStatusCode.BAD_REQUEST)
    }

    if (days.length === 0) {
        return c.json({
            message: "Days cannot be empty"
        }, HttpStatusCode.BAD_REQUEST)
    }

    const dbOutlet = await db.query.outlet.findFirst({
        where: (outlets, { eq }) => eq(outlets.id, id),
    })

    if (!dbOutlet) {
        return c.json({
            message: "Outlet not found"
        }, HttpStatusCode.NOT_FOUND)
    }

    const result = await db.transaction(async (tx) => {
        const [dbInfinityPass] = await tx.insert(infinityPass).values({
            commission,
            days,
            endTime,
            price,
            startTime,
            cuisine,
            liquorType,
            specialOffer,
        }).returning()

        await tx
            .update(outlet)
            .set({
                infinityPassId: dbInfinityPass.id
            })
        return dbInfinityPass
    })

    const response = {
        message: "Infinity Pass created",
        data: result
    }

    return c.json(response, HttpStatusCode.CREATED)
}

export const getInfinityPassById: AppRouteHandler<GetInfinityPassByIdSchema> = async (c) => {
    const { id } = c.req.valid("param");

    const outlet = await db.query.outlet.findFirst({
        where: (outlets, { eq }) => eq(outlets.id, id),
        columns: {
            id: true,
            createdAt: true,
            updatedAt: true,
            infinityPassId: true,
        },
        with: {
            infinityPass: true,
        },
    })

    if (!outlet) {
        return c.json({
            message: "Outlet not found"
        }, HttpStatusCode.NOT_FOUND)
    }

    if (!outlet.infinityPass) {
        return c.json({
            message: "Outlet does not have an infinity pass"
        }, HttpStatusCode.NOT_FOUND)
    }

    const response = {
        message: "Outlet found",
        data: {
            id: outlet.id,
            createdAt: outlet.createdAt,
            updatedAt: outlet.updatedAt,
            infinityPass: outlet.infinityPass ? outlet.infinityPass : undefined,
        }
    }

    return c.json(response, HttpStatusCode.OK)
}