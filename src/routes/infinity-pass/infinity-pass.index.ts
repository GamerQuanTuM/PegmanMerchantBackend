import createRouter from "@/lib/create-app";
import * as handler from "./infinity-pass.handler";
import * as routes from "./infinity-pass.route";
import { AppBindings } from "@/types";

const router = createRouter<AppBindings>()
    .openapi(routes.createInfinityPassSchema, handler.createInfinityPass)
    .openapi(routes.getInfinityPassByIdSchema, handler.getInfinityPassById)


export default router;