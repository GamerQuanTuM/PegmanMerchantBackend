import type { OpenAPIHono, RouteConfig, RouteHandler } from "@hono/zod-openapi";
import { Context } from "hono";

// Define your application bindings
export type AppBindings = {
    Variables: {
        user: {
            sub: string;
            // role:  "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "USER";
        },
    }
}

// Define your application's OpenAPI type
export type AppOpenAPI = OpenAPIHono<AppBindings>

// Define an authenticated context type
export type AuthenticatedContext = Context<AppBindings>

// Define a type for your route handlers
export type AppRouteHandler<R extends RouteConfig> = RouteHandler<R, AppBindings>