import createRouter from "@/lib/create-app";
import * as handler from "./owner.handler";
import * as routes from "./owner.route";


const router = createRouter()
    .openapi(routes.updateOwner, handler.updateOwner)
    .openapi(routes.getOwnerById, handler.getOwnerById)


export default router;