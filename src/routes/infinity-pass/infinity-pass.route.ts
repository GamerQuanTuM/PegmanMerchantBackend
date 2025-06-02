import { createRoute,z } from "@hono/zod-openapi";
import * as HttpStatusCode from "stoker/http-status-codes"
import * as HttpStatusPhrases from "stoker/http-status-phrases"
import { infinityPassResponseSchema, insertInfinityPassSchema, selectInfinityPassSchema, selectOutletSchema } from "@/db/schema";
import protect from "@/middlewares/protect";
import { jsonContent, jsonContentOneOf } from "stoker/openapi/helpers";
import { createErrorSchema, createMessageObjectSchema, IdUUIDParamsSchema } from "stoker/openapi/schemas";

const selectOutletSchemaWithInfinityPass = z.object({
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
      infinityPass: selectInfinityPassSchema.optional(),
    })
});

export const createInfinityPassSchema = createRoute({
    tags: ["infinity-pass"],
    method: "post",
    path: "/outlet/{id}/infinity-pass",
    middleware: [protect],
    request: {
        body: jsonContent(
            insertInfinityPassSchema,
            "Creation of Infinity Pass"
        ),
        params: IdUUIDParamsSchema
    },
    responses: {
        [HttpStatusCode.CREATED]: jsonContent(
            infinityPassResponseSchema,
            HttpStatusPhrases.CREATED
        ),
        [HttpStatusCode.UNPROCESSABLE_ENTITY]: jsonContentOneOf(
            [createErrorSchema(IdUUIDParamsSchema), createErrorSchema(insertInfinityPassSchema)],
            "Validation error"
        ),
        [HttpStatusCode.BAD_REQUEST]: jsonContent(
            createMessageObjectSchema(HttpStatusPhrases.BAD_REQUEST),
            HttpStatusPhrases.BAD_REQUEST
        ),
        [HttpStatusCode.NOT_FOUND]: jsonContent(
            createMessageObjectSchema(HttpStatusPhrases.NOT_FOUND),
            HttpStatusPhrases.NOT_FOUND
        )
    }
})

export const getInfinityPassByIdSchema = createRoute({
    tags: ["infinity-pass"],
    method: "get",
    path: "/outlet/{id}/infinity-pass",
    middleware: [protect],
    request: {
        params: IdUUIDParamsSchema
    },
    responses: {
        [HttpStatusCode.OK]: jsonContent(
            selectOutletSchemaWithInfinityPass,
            HttpStatusPhrases.OK
        ),
        [HttpStatusCode.NOT_FOUND]: jsonContent(
            createMessageObjectSchema(HttpStatusPhrases.NOT_FOUND),
            HttpStatusPhrases.NOT_FOUND
        ),

        [HttpStatusCode.UNPROCESSABLE_ENTITY]: jsonContent(
            createErrorSchema(IdUUIDParamsSchema),
            "Validation error"
        ),
    }
})

export type CreateInfinityPassSchema = typeof createInfinityPassSchema
export type GetInfinityPassByIdSchema = typeof getInfinityPassByIdSchema