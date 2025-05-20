import { verify } from "hono/jwt"
import * as HttpStatusCode from "stoker/http-status-codes"
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { MiddlewareHandler } from "hono";
import env from "@/env"
import { db } from "@/db";
import { AppBindings } from "@/types";

// Export the middleware as a properly typed MiddlewareHandler
const protect: MiddlewareHandler<AppBindings> = async (c, next) => {
    // Get authorization header
    const authHeader = c.req.header('Authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json(
            { 
                error: HttpStatusPhrases.UNAUTHORIZED,
                message: "Authentication token is missing or malformed" 
            }, 
            HttpStatusCode.UNAUTHORIZED
        )
    }

    try {
        const token = authHeader.split(' ')[1]
        const decoded = await verify(token, env.JWT_SECRET) as {
            sub: string
            email: string
        }

        // Find user by ID (from decoded token)
        const user = await db.query.owner.findFirst({
            where: (owner, { eq }) => eq(owner.id, decoded.sub),
        })

        if (!user) {
            return c.json(
                { 
                    error: HttpStatusPhrases.NOT_FOUND,
                    message: "User associated with this token no longer exists" 
                }, 
                HttpStatusCode.NOT_FOUND
            )
        }

        // Attach the user to the request context
        c.set('user', {
            sub: user.id,
        })

        // Important: return the result of next() to properly continue the middleware chain
        return await next()
    } catch (error) {
        console.error("Authentication error:", error)
        return c.json(
            { 
                error: HttpStatusPhrases.UNAUTHORIZED, // Changed from INTERNAL_SERVER_ERROR for security
                message: "Invalid authentication token" 
            }, 
            HttpStatusCode.UNAUTHORIZED // Changed for appropriate error handling
        )
    }
}

export default protect