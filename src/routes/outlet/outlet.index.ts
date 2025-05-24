import createRouter from "@/lib/create-app";
import * as handler from "./outlet.handler";
import * as routes from "./outlet.route";

const router = createRouter()
    .openapi(routes.createOutletDetailsSchema, handler.createOutletDetails)
    .openapi(routes.createOutletLegalDocuments, handler.createOutletLegalDocuments)
    .openapi(routes.createOutletTimingSchema, handler.createOutletTiming)
    .openapi(routes.createOutletSchema, handler.createOutlet)
    .openapi(routes.getOutletSchemaById, handler.getOutletById)
    .openapi(routes.verifyOutletSchema, handler.verifyOutlet)

export default router;