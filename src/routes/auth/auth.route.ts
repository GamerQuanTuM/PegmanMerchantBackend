import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCode from "stoker/http-status-codes"
import { createErrorSchema, createMessageObjectSchema, } from "stoker/openapi/schemas";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { jsonContent } from "stoker/openapi/helpers";
import { ownerOtpSchema, selectOtpSchema, ownerResponseSchema } from "../../db/schema/owner.schema";
import protect from "../../middlewares/protect";

// Owner generate otp
export const generateOtp = createRoute({
    tags: ["auth"],
    path: "/generate-otp",
    method: "post",
    request: {
        body: jsonContent(
            z.object({
                mobile_number: z.string().min(10).max(10),
                login: z.boolean().default(true)
            }),
            "Generate OTP request"
        ),
    },
    responses: {
        [HttpStatusCode.OK]: jsonContent(
            createMessageObjectSchema("Otp sent successfully"),
            "Otp sent successfully"
        ),
        [HttpStatusCode.UNPROCESSABLE_ENTITY]: jsonContent(
            createErrorSchema(
                z.object({
                    mobile_number: z.string().min(10).max(10),
                })
            ),
            "Validation error",
        ),
    }
})

// Owner signup
export const signup = createRoute({
    tags: ["auth"],
    path: "/signup",
    method: "post",
    request: {
        body: jsonContent(selectOtpSchema, "Sign up request"),

    },
    responses: {
        [HttpStatusCode.CREATED]: jsonContent(
            ownerResponseSchema,
            "Sign up success"
        ),
        [HttpStatusCode.UNPROCESSABLE_ENTITY]: jsonContent(
            createErrorSchema(ownerOtpSchema),
            "Validation error",
        ),
        [HttpStatusCode.BAD_REQUEST]: jsonContent(
            createMessageObjectSchema("Otp is invalid"),
            "Otp error",
        ),
        [HttpStatusCode.CONFLICT]: jsonContent(
            createMessageObjectSchema("User already exists"),
            HttpStatusPhrases.CONFLICT,
        ),
    }
})

// Owner login
export const login = createRoute({
    tags: ["auth"],
    path: "/login",
    method: "post",
    request: {
        body: jsonContent(selectOtpSchema, "Login request"),
    },
    responses: {
        [HttpStatusCode.OK]: jsonContent(
            ownerResponseSchema,
            "Login success"
        ),
        [HttpStatusCode.UNPROCESSABLE_ENTITY]: jsonContent(
            createErrorSchema(ownerOtpSchema),
            "Validation error",
        ),
        [HttpStatusCode.BAD_REQUEST]: jsonContent(
            createMessageObjectSchema("Otp is invalid"),
            "Otp error",
        ),
        [HttpStatusCode.NOT_FOUND]: jsonContent(
            createMessageObjectSchema("User not found"),
            HttpStatusPhrases.NOT_FOUND,
        )
    }
})

export const protectedRoute = createRoute({
    tags: ["auth"],
    path: "/protected",
    middleware: [protect],
    method: "get",
    responses: {
        200: {
            description: "Protected route",
            content: {
                "application/json": {
                    schema: z.string(),
                },
            },
        }

    }
})

export type SignupRoute = typeof signup;
export type LoginRoute = typeof login;
export type ProtectedRoute = typeof protectedRoute;
export type GenerateOtpRoute = typeof generateOtp;