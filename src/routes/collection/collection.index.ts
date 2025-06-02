import createRouter from "@/lib/create-app";
import * as handlers from "./collection.handler";
import * as routes from "./collection.route";


const router = createRouter()
   .openapi(routes.createCollectionSchema, handlers.createCollection)
   .openapi(routes.updateOutletWithCollectionsSchema, handlers.updateOutletWithCollections)
   .openapi(routes.getCollectionByOutletIdSchema, handlers.getCollectionByOutletId)
export default router;