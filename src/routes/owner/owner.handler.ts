import * as HttpStatusCode from "stoker/http-status-codes"
import { AppRouteHandler } from "@/types";
import { UpdateOwnerRoute, GetOwnerByIdRoute } from "./owner.route"
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { owner } from "@/db/schema";

export const updateOwner: AppRouteHandler<UpdateOwnerRoute> = async (c) => {

    const userId = c.var.user.sub
    const { email, name } = c.req.valid('json')

    const user = await db.query.owner.findFirst({
        where: (owner, { eq }) => eq(owner.id, userId ?? "")
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
    const { outlets, bartender, crystalCollection, details, goldCollection, infinityPass, legalDocument, manager, silverCollection, timing } = c.req.valid("query")

    const nestedWith = {
        bartender,
        crystalCollection,
        goldCollection,
        silverCollection,
        details,
        infinityPass,
        legalDocument,
        manager,
        timing: timing ? {
            with: {
                slots: true
            }
        } : undefined,
    };

    const filteredWith = Object.fromEntries(
        Object.entries(nestedWith).filter(([_, value]) => value)
    );

    let outletsWith: true | { with: typeof filteredWith } | undefined;

    if (outlets === true) {
        outletsWith = true;
    } else if (Object.keys(filteredWith).length > 0) {
        outletsWith = { with: filteredWith };
    } else {
        outletsWith = undefined;
    }


    const user = await db.query.owner.findFirst({
        where: (owner, { eq }) => eq(owner.id, id),
        with: {
            outlets: outletsWith,
        },
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

// const getOwnerOutletDetails