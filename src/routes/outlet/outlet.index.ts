import createRouter from "@/lib/create-app";
import * as handler from "./outlet.handler";
import * as routes from "./outlet.route";

const router = createRouter()
    .openapi(routes.createOutletRoute, handler.createOutlet)

export default router;