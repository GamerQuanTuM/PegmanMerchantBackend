import createRouter from "@/lib/create-app";
import * as handler from "./infinity-pass.handler";
import * as routes from "./infinity-pass.route";

const router = createRouter()
    .openapi(routes.createInfinityPassSchema, handler.createInfinityPass)
    .openapi(routes.getInfinityPassByIdSchema, handler.getInfinityPassById)


export default router;