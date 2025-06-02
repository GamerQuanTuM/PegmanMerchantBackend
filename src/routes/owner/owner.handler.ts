import * as HttpStatusCode from "stoker/http-status-codes"
import { AppRouteHandler } from "@/types";
import { UpdateOwnerRoute, GetOwnerByIdRoute } from "./owner.route"
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { owner } from "@/db/schema";

export const updateOwner: AppRouteHandler<UpdateOwnerRoute> = async (c) => {
    const { email, mobileNumber, name } = c.req.valid('json')

    const user = await db.query.owner.findFirst({
        where: (owner, { eq }) => eq(owner.mobileNumber, mobileNumber ?? "")
    })

    if (!user) {
        return c.json({ message: "User not found" }, HttpStatusCode.NOT_FOUND)
    }

    const [inserted] = await db.update(owner)
        .set({
            email,
            name,
        })
        .where(eq(owner.id, user.id))
        .returning()

    const response = {
        data: inserted,
        message: "User updated successfully",
    }

    return c.json(response, HttpStatusCode.OK)
}

export const getOwnerById: AppRouteHandler<GetOwnerByIdRoute> = async (c) => {
    const { id } = c.req.valid("param")
    const user = await db.query.owner.findFirst({
        where: (owner, { eq }) => eq(owner.id, id)
    })

    if (!user) {
        return c.json({ message: "User not found" }, HttpStatusCode.NOT_FOUND)
    }

    const response = {
        data: user,
        message: "User found successfully",
    }

    return c.json(response, HttpStatusCode.OK)

}