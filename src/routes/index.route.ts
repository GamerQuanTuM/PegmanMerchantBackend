import createRouter from "../lib/create-app";
import { createRoute } from "@hono/zod-openapi";
import { jsonContent } from "stoker/openapi/helpers";
import * as HttpStatusCode from "stoker/http-status-codes";
import { createMessageObjectSchema } from "stoker/openapi/schemas";

const router = createRouter()
    .openapi(createRoute({
        tags: ["Health Check"],
        method: "get",
        path: "/",
        responses: {
            [HttpStatusCode.OK]: jsonContent(
                createMessageObjectSchema("Pegman API"),
                "Pegman API Index"
            )
        }
    }), async (c) => {
        // const esClient = c.get("es");

        // let creationResult = {
        //     outlets: "already exists",
        //     passes: "already exists"
        // };

        try {
            // // Check if indexes exist - note we need to check response.body
            // const outletsExistsResponse = await indexExists(esClient, outletIdx);
            // const passesExistsResponse = await indexExists(esClient, passesIdx);

            // const outletsIndexExists = (outletsExistsResponse as unknown as { body: boolean }).body;
            // const passesIndexExists = (passesExistsResponse as unknown as { body: boolean }).body;

            // // Create indexes if they don't exist
            // if (!outletsIndexExists) {
            //     await createIndex(esClient, outletIdx, outletMapping);
            //     creationResult.outlets = "created successfully";
            // }

            // if (!passesIndexExists) {
            //     await createIndex(esClient, passesIdx, passesMapping);
            //     creationResult.passes = "created successfully";
            // }

            return c.json({
                message: "Pegman server is running",
                // indexes: creationResult
            }, HttpStatusCode.OK);

        } catch (error: any) {
            console.error("Error handling indexes:", error);
            return c.json({
                message: "Pegman server is running",
                // error: "Error checking/creating indexes",
                details: error.message,
                // indexes: creationResult
            }, HttpStatusCode.OK);
        }
    });

export default router;