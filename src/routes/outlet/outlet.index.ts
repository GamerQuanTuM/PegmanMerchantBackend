import createRouter from "../../lib/create-app";
import * as handler from "./outlet.handler";
import * as routes from "./outlet.route";
import { AppBindings } from "../../types";

const router = createRouter<AppBindings>()
    .openapi(routes.createOutletDetailsSchema, handler.createOutletDetails)
    .openapi(routes.createOutletLegalDocuments, handler.createOutletLegalDocuments)
    .openapi(routes.createOutletTimingSchema, handler.createOutletTiming)
    .openapi(routes.createOutletSchema, handler.createOutlet)
    .openapi(routes.getOutletSchemaById, handler.getOutletById)
    .openapi(routes.verifyOutletSchema, handler.verifyOutlet)
    .openapi(routes.addOutletTimingSlotSchema, handler.addOutletTiming)
    .openapi(routes.modifyOutletTimingSlotSchema, handler.updateOutletTimingSlot)

export default router;