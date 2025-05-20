import * as HttpStatusCode from "stoker/http-status-codes"
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { createRoute, z } from "@hono/zod-openapi";
import { ownerResponseSchema, updateOwnerResponseSchema, updateOwnerSchema } from "@/db/schema";
import { jsonContent } from "stoker/openapi/helpers";
import { createErrorSchema, createMessageObjectSchema, IdUUIDParamsSchema } from "stoker/openapi/schemas";
import protect from "@/middlewares/protect";

// Update owner by unique mobile number
export const updateOwner = createRoute({
    tags: ["owner"],
    path: "/owner/update",
    middleware: [protect], 
    method: "put",
    request: {
        body: jsonContent(updateOwnerSchema, "Update owner request")
    },
    responses: {
        [HttpStatusCode.OK]: jsonContent(
            ownerResponseSchema,
            "Update owner success"
        ),
        [HttpStatusCode.UNPROCESSABLE_ENTITY]: jsonContent(
            createErrorSchema(updateOwnerResponseSchema),
            "Validation error",
        ),
        [HttpStatusCode.NOT_FOUND]: jsonContent(
            createMessageObjectSchema("User not found"),
            HttpStatusPhrases.NOT_FOUND,
        ),
        [HttpStatusCode.UNAUTHORIZED]: jsonContent(
            createMessageObjectSchema("Authentication required"),
            HttpStatusPhrases.UNAUTHORIZED,
        ),
    }
})

// Get owner by unique id
export const getOwnerById = createRoute({
    tags: ["owner"],
    path: "/owner/{id}",
    middleware: [protect],
    method: "get",
    request: {
        params: IdUUIDParamsSchema
    },
    responses: {
        [HttpStatusCode.OK]: jsonContent(
            ownerResponseSchema,
            "Get owner success"
        ),
        [HttpStatusCode.NOT_FOUND]: jsonContent(
            createMessageObjectSchema("User not found"),
            HttpStatusPhrases.NOT_FOUND,
        ),
        [HttpStatusCode.UNPROCESSABLE_ENTITY]: jsonContent(
            createErrorSchema(IdUUIDParamsSchema),
           "Invalid id",
        ),

    }
})


export type UpdateOwnerRoute = typeof updateOwner;
export type GetOwnerByIdRoute = typeof getOwnerById;