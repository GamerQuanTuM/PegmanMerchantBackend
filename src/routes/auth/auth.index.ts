import createRouter from "@/lib/create-app";

import * as handlers from "./auth.handler";
import * as routes from "./auth.route";

const router = createRouter()
    .openapi(routes.generateOtp, handlers.generateOtp)
    .openapi(routes.signup, handlers.signup)
    .openapi(routes.login, handlers.login)
    .openapi(routes.protectedRoute, handlers.protectedRoute)

export default router;