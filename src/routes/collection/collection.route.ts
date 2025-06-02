import { createRoute, z } from "@hono/zod-openapi";
import { jsonContent } from "stoker/openapi/helpers";
import * as HttpStatusCode from "stoker/http-status-codes"
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { insertCollectionSchema, insertLiquorSchema, selectOutletCollectionSchema, selectLiquorSchema, selectOutletSchema } from "@/db/schema";
import protect from "@/middlewares/protect";
import { createMessageObjectSchema, IdUUIDParamsSchema } from "stoker/openapi/schemas";
import { tierEnum } from "@/db/schema/enums";

const insertCollectionSchemaWithLiquor = z.object({
    ...insertCollectionSchema._def.schema.shape,
    liquors: insertLiquorSchema.array(),
})

const responseCollectionSchemaWithLiquor = z.object({
    message: z.string(),
    data: z.object({
        ...selectOutletCollectionSchema.shape,
        liquors: selectLiquorSchema.array(),
    }),
})

const selectOutletSchemaWithCollections = z.object({
    message: z.string(),
    data: selectOutletSchema.omit({
        ownerId: true,
        detailsId: true,
        legalDocumentId: true,
        managerId: true,
        timingId: true,
        bartenderId: true,
        infinityPassId: true,
        is_verified: true,
        goldCollectionId: true,
        silverCollectionId: true,
        crystalCollectionId: true,
    }).extend({
        goldCollection: selectOutletCollectionSchema.optional(),
        silverCollection: selectOutletCollectionSchema.optional(),
        crystalCollection: selectOutletCollectionSchema.optional(),
    })
});

export const createCollectionSchema = createRoute({
    tags: ["collection"],
    method: "post",
    path: "/collection",
    middleware: [protect],
    request: {
        body: jsonContent(
            insertCollectionSchemaWithLiquor,
            "Create Collection"
        ),
    },
    responses: {
        [HttpStatusCode.CREATED]: jsonContent(
            responseCollectionSchemaWithLiquor,
            HttpStatusPhrases.CREATED
        ),

        [HttpStatusCode.BAD_REQUEST]: jsonContent(
            createMessageObjectSchema(HttpStatusPhrases.BAD_REQUEST),
            HttpStatusPhrases.BAD_REQUEST
        ),
        [HttpStatusCode.UNPROCESSABLE_ENTITY]: jsonContent(
            insertCollectionSchema,
            HttpStatusPhrases.UNPROCESSABLE_ENTITY
        ),
    },
})

export const updateOutletWithCollectionsSchema = createRoute({
    tags: ["collection"],
    method: "patch",
    path: "/outlet/{id}/collection",
    middleware: [protect],
    request: {
        body: jsonContent(
            z.object({
                goldCollectionId: z.string().uuid().optional(),
                silverCollectionId: z.string().uuid().optional(),
                crystalCollectionId: z.string().uuid().optional(),
            }),
            "Update Outlet"
        ),
        params: IdUUIDParamsSchema,
    },
    responses: {
        [HttpStatusCode.OK]: jsonContent(
            selectOutletSchemaWithCollections,
            HttpStatusPhrases.OK
        ),
        [HttpStatusCode.BAD_REQUEST]: jsonContent(
            createMessageObjectSchema(HttpStatusPhrases.BAD_REQUEST),
            HttpStatusPhrases.BAD_REQUEST
        ),
        [HttpStatusCode.NOT_FOUND]: jsonContent(
            createMessageObjectSchema(HttpStatusPhrases.NOT_FOUND),
            HttpStatusPhrases.NOT_FOUND
        ),
        [HttpStatusCode.UNPROCESSABLE_ENTITY]: jsonContent(
            z.object({
                goldCollectionId: z.string().uuid().optional(),
                silverCollectionId: z.string().uuid().optional(),
                crystalCollectionId: z.string().uuid().optional(),
            }),
            HttpStatusPhrases.UNPROCESSABLE_ENTITY
        ),
    }
})

export const getCollectionByOutletIdSchema = createRoute({
    tags: ["collection"],
    method: "get",
    path: "/outlet/{id}/collection",
    middleware: [protect],
    request: {
        params: IdUUIDParamsSchema,
        query: z.object({
            tier: z.enum(tierEnum.enumValues),
        })
    },
    responses: {
        [HttpStatusCode.OK]: jsonContent(
            selectOutletSchemaWithCollections,
            HttpStatusPhrases.OK
        ),
        [HttpStatusCode.BAD_REQUEST]: jsonContent(
            createMessageObjectSchema(HttpStatusPhrases.BAD_REQUEST),
            HttpStatusPhrases.BAD_REQUEST
        ),
        [HttpStatusCode.NOT_FOUND]: jsonContent(
            createMessageObjectSchema(HttpStatusPhrases.NOT_FOUND),
            HttpStatusPhrases.NOT_FOUND
        ),
        [HttpStatusCode.UNPROCESSABLE_ENTITY]: jsonContent(
            z.object({
                tier: z.enum(tierEnum.enumValues),
            }),
            HttpStatusPhrases.UNPROCESSABLE_ENTITY
        ),
        
    }
})

export type CreateCollectionSchema = typeof createCollectionSchema
export type UpdateOutletWithCollectionsSchema = typeof updateOutletWithCollectionsSchema
export type GetCollectionByOutletIdSchema = typeof getCollectionByOutletIdSchema