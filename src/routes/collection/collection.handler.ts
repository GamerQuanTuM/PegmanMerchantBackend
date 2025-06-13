import * as HttpStatusCode from "stoker/http-status-codes"
import { eq } from "drizzle-orm";
import { AppRouteHandler } from "../../types";
import { CreateCollectionSchema, UpdateOutletWithCollectionsSchema, GetCollectionByOutletIdSchema } from "./collection.route";
import { db } from "../../db";
import { collection, liquor, outlet } from "../../db/schema";

type CollectionIdType = "goldCollectionId" | "silverCollectionId" | "crystalCollectionId";


export const createCollection: AppRouteHandler<CreateCollectionSchema> = async (c) => {
    const {
        bookingPrice,
        endDate,
        labelOne,
        labelTwo,
        pegsPerDay,
        startDate,
        type,
        liquors,
    } = c.req.valid("json");


    if (!liquors || liquors.length === 0) {
        return c.json(
            {
                message: "Collection must contain at least one liquor item"
            },
            HttpStatusCode.BAD_REQUEST
        );
    }

    // Validate date logic
    if (new Date(startDate) >= new Date(endDate)) {
        return c.json(
            {
                message: "Start date must be before end date"
            },
            HttpStatusCode.BAD_REQUEST
        );
    }

    // Validate liquor data
    for (const liquor of liquors) {
        if (!liquor.brandNames || !liquor.category || liquor.startingPrice == null) {
            return c.json(
                {
                    message: "Each liquor must have brandNames, category, and startingPrice"
                },
                HttpStatusCode.BAD_REQUEST
            );
        }
    }

    // Execute in transaction for data consistency
    const result = await db.transaction(async (tx) => {
        // Insert collection
        const [insertedCollectionData] = await tx.insert(collection).values({
            bookingPrice,
            endDate,
            labelOne,
            labelTwo,
            pegsPerDay,
            startDate,
            type,
        }).returning();

        // Batch insert liquors for better performance
        const insertedLiquors = await tx.insert(liquor).values(
            liquors.map((liquorData) => ({
                brandNames: liquorData.brandNames,
                category: liquorData.category,
                startingPrice: liquorData.startingPrice,
                collectionId: insertedCollectionData.id,
            }))
        ).returning();

        return { insertedCollectionData, insertedLiquors };
    });

    const response = {
        message: "Collection created successfully",
        data: {
            ...result.insertedCollectionData,
            liquors: result.insertedLiquors,
        },
    };

    return c.json(response, HttpStatusCode.CREATED);
};


export const updateOutletWithCollections: AppRouteHandler<UpdateOutletWithCollectionsSchema> = async (c) => {
    const { crystalCollectionId, goldCollectionId, silverCollectionId } = c.req.valid("json");
    const { id } = c.req.valid("param");

    const dbOutlet = await db.query.outlet.findFirst({
        where: (outlet, { eq }) => eq(outlet.id, id),
    });

    if (!dbOutlet) {
        return c.json(
            {
                message: "Outlet not found"
            },
            HttpStatusCode.NOT_FOUND
        );
    }

    if (goldCollectionId && dbOutlet?.goldCollectionId) {
        return c.json(
            {
                message: "Gold collection is already assigned to this outlet"
            },
            HttpStatusCode.BAD_REQUEST
        );
    }

    if (silverCollectionId && dbOutlet?.silverCollectionId) {
        return c.json(
            {
                message: "Silver collection is already assigned to this outlet"
            },
            HttpStatusCode.BAD_REQUEST
        );
    }

    if (crystalCollectionId && dbOutlet?.crystalCollectionId) {
        return c.json(
            {
                message: "Crystal collection is already assigned to this outlet"
            },
            HttpStatusCode.BAD_REQUEST
        );
    }

    const updateData: Partial<Record<CollectionIdType, string>> = {};

    if (goldCollectionId) updateData.goldCollectionId = goldCollectionId;
    if (silverCollectionId) updateData.silverCollectionId = silverCollectionId;
    if (crystalCollectionId) updateData.crystalCollectionId = crystalCollectionId;

    // Update the outlet
    await db.update(outlet)
        .set(updateData)
        .where(eq(outlet.id, dbOutlet.id));

    // Query the updated outlet with collections
    const updatedOutletWithCollections = await db.query.outlet.findFirst({
        where: (outlet, { eq }) => eq(outlet.id, dbOutlet.id),
        with: {
            goldCollection: true,
            silverCollection: true,
            crystalCollection: true,
        },
        columns: {
            createdAt: true,
            updatedAt: true,
            silverCollectionId: true,
            goldCollectionId: true,
            crystalCollectionId: true,
            id: true,
        }
    });

    if (!updatedOutletWithCollections) return c.json({
        message: "Outlet not found",
    }, HttpStatusCode.NOT_FOUND)

    const response = {
        message: "Outlet updated successfully",
        data: {
            id: updatedOutletWithCollections.id,
            createdAt: updatedOutletWithCollections.createdAt || null,
            updatedAt: updatedOutletWithCollections.updatedAt || null,
            goldCollection: updatedOutletWithCollections.goldCollection || undefined,
            silverCollection: updatedOutletWithCollections.silverCollection || undefined,
            crystalCollection: updatedOutletWithCollections.crystalCollection || undefined,
        },
    };

    return c.json(response, HttpStatusCode.OK);
};

export const getCollectionByOutletId: AppRouteHandler<GetCollectionByOutletIdSchema> = async (c) => {
    const { id } = c.req.valid("param");
    const { tier } = c.req.valid("query");
    if (!tier) return c.json({
        message: "Tier is required",
    }, HttpStatusCode.BAD_REQUEST)

    let dbOutlet;
    if (tier === "GOLD") {
        dbOutlet = await db.query.outlet.findFirst({
            where: (outlet, { eq }) => eq(outlet.id, id),
            with: {
                goldCollection: true,
            },
            columns: {
                createdAt: true,
                updatedAt: true,
                goldCollectionId: true,
                silverCollectionId: true,
                crystalCollectionId: true,
                id: true,
            }
        })
    } else if (tier === "SILVER") {
        dbOutlet = await db.query.outlet.findFirst({
            where: (outlet, { eq }) => eq(outlet.id, id),
            with: {
                silverCollection: true,
            },
            columns: {
                createdAt: true,
                updatedAt: true,
                goldCollectionId: true,
                silverCollectionId: true,
                crystalCollectionId: true,
                id: true,
            }
        })
    } else {
        dbOutlet = await db.query.outlet.findFirst({
            where: (outlet, { eq }) => eq(outlet.id, id),
            with: {
                crystalCollection: true,
            },
            columns: {
                createdAt: true,
                updatedAt: true,
                goldCollectionId: true,
                silverCollectionId: true,
                crystalCollectionId: true,
                id: true,
            }
        })
    }

    
    if (!dbOutlet) return c.json({
        message: "Outlet not found",
    }, HttpStatusCode.NOT_FOUND)


    if (tier === "GOLD" && dbOutlet?.goldCollectionId === null) return c.json({
        message: "Gold collection not found",
    }, HttpStatusCode.NOT_FOUND)

    if (tier === "SILVER" && dbOutlet?.silverCollectionId === null) return c.json({
        message: "Silver collection not found",
    }, HttpStatusCode.NOT_FOUND)

    if (tier === "CRYSTAL" && dbOutlet?.crystalCollectionId === null) return c.json({
        message: "Crystal collection not found",
    }, HttpStatusCode.NOT_FOUND)


    const response = {
        message: "Collection fetched successfully",
        data: {
            id: dbOutlet.id,
            createdAt: dbOutlet.createdAt || null,
            updatedAt: dbOutlet.updatedAt || null,
            goldCollection: 'goldCollection' in dbOutlet ? (dbOutlet.goldCollection || undefined) : undefined,
            silverCollection: 'silverCollection' in dbOutlet ? (dbOutlet.silverCollection || undefined) : undefined,
            crystalCollection: 'crystalCollection' in dbOutlet ? (dbOutlet.crystalCollection || undefined) : undefined,
        }
    }
    return c.json(response, HttpStatusCode.OK)
}