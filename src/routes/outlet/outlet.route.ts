import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCode from "stoker/http-status-codes"
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { createErrorSchema, createMessageObjectSchema, IdUUIDParamsSchema } from "stoker/openapi/schemas";
import { jsonContent, jsonContentOneOf } from "stoker/openapi/helpers";
import protect from "../../middlewares/protect";
import { insertOutletLegalDocumentSchema, outletLegalDocumentsResponseSchema } from "../../db/schema/outlet-legal-document.schema";
import { fullOutletDetailsInsertSchema, insertOutletSchema, insertOutletTimingSchema, insertOutletTimingSchemaWithSlot, insertOutletTimingSlotSchema, outletResponseSchema, outletResponseSchemaWithRelations, outletsDetailsResponseSchema, outletTimingResponseSchema, outletTimingSlotResponseSchema, updateOutletTimingSlotSchema, updateVerifyOutletSchema } from "../../db/schema";

const OutletQuerySchema = z.object({
    owner: z.coerce.boolean().optional().default(false),
    legalDocument: z.coerce.boolean().optional().default(false),
    details: z.coerce.boolean().optional().default(false),
    timing: z.coerce.boolean().optional().default(false),
    bartender: z.coerce.boolean().optional().default(false),
    manager: z.coerce.boolean().optional().default(false),
});


export const createOutletLegalDocuments = createRoute({
    tags: ["outlet"],
    method: "post",
    path: "/outlet-legal-documents",
    middleware: [protect],
    request: {
        body: {
            content: {
                "multipart/form-data": {
                    schema: insertOutletLegalDocumentSchema
                },

            },
            description: "Outlet Legal Documents Created",
        }
    },
    responses: {
        [HttpStatusCode.CREATED]: jsonContent(
            outletLegalDocumentsResponseSchema,
            "Outlet Legal Documents Created"
        ),

        [HttpStatusCode.UNPROCESSABLE_ENTITY]: jsonContent(
            createErrorSchema(insertOutletLegalDocumentSchema),
            "Validation error"
        ),

    },
})

export const createOutletDetailsSchema = createRoute({
    tags: ["outlet"],
    method: "post",
    path: "/outlet-details",
    middleware: [protect],
    request: {
        body: {
            content: {
                "multipart/form-data": {
                    schema: fullOutletDetailsInsertSchema
                },

            },
            description: "Outlet Details Created",
        }
    },
    responses: {
        [HttpStatusCode.CREATED]: jsonContent(
            outletsDetailsResponseSchema,
            "Outlet Details Created"
        ),

        [HttpStatusCode.UNPROCESSABLE_ENTITY]: jsonContent(
            createErrorSchema(fullOutletDetailsInsertSchema),
            "Validation error"
        ),
        [HttpStatusCode.BAD_REQUEST]: jsonContent(
            createMessageObjectSchema(HttpStatusPhrases.BAD_REQUEST),
            HttpStatusPhrases.BAD_REQUEST
        ),
    }
})

export const createOutletTimingSchema = createRoute({
    tags: ["outlet"],
    method: "post",
    path: "/outlet-timing",
    middleware: [protect],
    request: {
        body: jsonContent(
            insertOutletTimingSchemaWithSlot,
            "Outlet Timing Created"
        )
    },
    responses: {
        [HttpStatusCode.CREATED]: jsonContent(
            outletTimingResponseSchema,
            "Outlet Timing Created"
        ),

        [HttpStatusCode.UNPROCESSABLE_ENTITY]: jsonContent(
            createErrorSchema(insertOutletTimingSchema),
            "Validation error"
        ),
        [HttpStatusCode.BAD_REQUEST]: jsonContent(
            createMessageObjectSchema(HttpStatusPhrases.BAD_REQUEST),
            HttpStatusPhrases.BAD_REQUEST
        ),
    }
})

export const createOutletSchema = createRoute({
    tags: ["outlet"],
    method: "post",
    path: "/outlet",
    middleware: [protect],
    request: {
        body: jsonContent(
            insertOutletSchema,
            "Outlet Created"
        )
    },
    responses: {
        [HttpStatusCode.CREATED]: jsonContent(
            outletResponseSchema,
            "Outlet Created"
        ),

        [HttpStatusCode.UNPROCESSABLE_ENTITY]: jsonContent(
            createErrorSchema(insertOutletSchema),
            "Validation error"
        ),
        [HttpStatusCode.NOT_FOUND]: jsonContent(
            createMessageObjectSchema(HttpStatusPhrases.NOT_FOUND),
            HttpStatusPhrases.NOT_FOUND
        ),
    }
})

export const getOutletSchemaById = createRoute({
    tags: ["outlet"],
    method: "get",
    path: "/outlet/{id}",
    middleware: [protect],
    request: {
        params: IdUUIDParamsSchema,
        query: OutletQuerySchema,
    },
    responses: {
        [HttpStatusCode.OK]: jsonContent(
            outletResponseSchemaWithRelations,
            "Outlet Found"
        ),
        [HttpStatusCode.NOT_FOUND]: jsonContent(
            createMessageObjectSchema(HttpStatusPhrases.NOT_FOUND),
            HttpStatusPhrases.NOT_FOUND
        ),
        [HttpStatusCode.UNPROCESSABLE_ENTITY]: jsonContentOneOf(
            [createErrorSchema(IdUUIDParamsSchema), createErrorSchema(OutletQuerySchema)],
            "Validation error"
        )
    }
})

export const verifyOutletSchema = createRoute({
    tags: ["outlet"],
    method: "patch",
    path: "/outlet/{id}/verify",
    middleware: [protect],
    request: {
        params: IdUUIDParamsSchema,
        body: jsonContent(
            updateVerifyOutletSchema,
            "Outlet Verified"
        )
    },
    responses: {
        [HttpStatusCode.OK]: jsonContent(
            outletResponseSchema,
            "Outlet Verified"
        ),
        [HttpStatusCode.NOT_FOUND]: jsonContent(
            createMessageObjectSchema(HttpStatusPhrases.NOT_FOUND),
            HttpStatusPhrases.NOT_FOUND
        ),
        [HttpStatusCode.UNPROCESSABLE_ENTITY]: jsonContentOneOf(
            [createErrorSchema(IdUUIDParamsSchema), createErrorSchema(updateVerifyOutletSchema)],
            "Validation error"
        )
    }
})

export const addOutletTimingSlotSchema = createRoute({
    tags: ["outlet"],
    method: "post",
    path: "/outlet-timing/{id}/slot",
    middleware: [protect],
    request: {
        params: IdUUIDParamsSchema,
        body: jsonContent(
            insertOutletTimingSlotSchema,
            "Outlet Timing Slot Created"
        )
    },
    responses: {
        [HttpStatusCode.CREATED]: jsonContent(
            outletTimingSlotResponseSchema,
            HttpStatusPhrases.CREATED
        ),
        [HttpStatusCode.UNPROCESSABLE_ENTITY]: jsonContent(
            createErrorSchema(insertOutletTimingSlotSchema),
            "Validation error"
        ),
        [HttpStatusCode.NOT_FOUND]: jsonContent(
            createMessageObjectSchema(HttpStatusPhrases.NOT_FOUND),
            HttpStatusPhrases.NOT_FOUND
        ),
        [HttpStatusCode.BAD_REQUEST]: jsonContent(
            createMessageObjectSchema(HttpStatusPhrases.BAD_REQUEST),
            HttpStatusPhrases.BAD_REQUEST
        ),
    }
})

export const modifyOutletTimingSlotSchema = createRoute({
    tags: ["outlet"],
    method: "patch",
    path: "/outlet-timing-slot/{id}",
    middleware: [protect],
    request: {
        params: IdUUIDParamsSchema,
        body: jsonContent(
            updateOutletTimingSlotSchema,
            "Outlet Timing Slot Updated"
        )
    },
    responses: {
        [HttpStatusCode.OK]: jsonContent(
            outletTimingSlotResponseSchema,
            HttpStatusPhrases.OK
        ),
        [HttpStatusCode.UNPROCESSABLE_ENTITY]: jsonContentOneOf(
            [createErrorSchema(IdUUIDParamsSchema), createErrorSchema(updateOutletTimingSlotSchema)],
            "Validation error"
        ),
        [HttpStatusCode.NOT_FOUND]: jsonContent(
            createMessageObjectSchema(HttpStatusPhrases.NOT_FOUND),
            HttpStatusPhrases.NOT_FOUND
        ),
    }
})

export type CreateOutletLegalDocumentsSchema = typeof createOutletLegalDocuments;
export type CreateOutletDetailsSchema = typeof createOutletDetailsSchema;
export type CreateOutletTimingSchema = typeof createOutletTimingSchema;
export type CreateOutletSchema = typeof createOutletSchema;
export type GetOutletSchemaById = typeof getOutletSchemaById;
export type VerifyOutletSchema = typeof verifyOutletSchema;
export type AddOutletTimingSlotSchema = typeof addOutletTimingSlotSchema;
export type UpdateOutletTimingSlotSchema = typeof modifyOutletTimingSlotSchema;