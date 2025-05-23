import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCode from "stoker/http-status-codes"
import { createErrorSchema, } from "stoker/openapi/schemas";
import { jsonContent } from "stoker/openapi/helpers";
import { outletCreationSchema, outletResponseSchema } from "@/db/schema/outlet.schema";
import protect from "@/middlewares/protect";


// Create outlet route
export const createOutletRoute = createRoute({
    tags: ["outlet"],
    path: "/create",
    middleware: [protect],
    method: "post",
    request: {
        body: {
            content: {
                "multipart/form-data": {
                    schema: outletCreationSchema
                }
            }
        }
    },
    responses: {
        [HttpStatusCode.CREATED]:
            jsonContent(
                outletResponseSchema,
                "Outlet creation"
            ),
        [HttpStatusCode.UNPROCESSABLE_ENTITY]: jsonContent(
            createErrorSchema(outletCreationSchema),
            "Validation error"
        ),
    }
})

export type OutletCreationSchema = typeof createOutletRoute;