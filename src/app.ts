import { createApp } from "./lib/create-app";
import configureOpenAPI from "./lib/configure-openapi";
import healthcheck from "./routes/index.route"
import authRouter from "./routes/auth/auth.index";
import ownerRouter from "./routes/owner/owner.index";
import outletRouter from "./routes/outlet/outlet.index";
import collectionRouter from "./routes/collection/collection.index";
import infinityPassRouter from "./routes/infinity-pass/infinity-pass.index";
// import { elasticsearchMiddleware } from "./helpers/elastic-search.js";


const app = createApp();

// app.use("*", elasticsearchMiddleware({
//     node: "http://localhost:9200"
// }))


const routes = [
    healthcheck,
    authRouter,
    ownerRouter,
    outletRouter,
    collectionRouter,
    infinityPassRouter
] as const;

routes.forEach((route) => {
    app.route("/", route as any);
})

configureOpenAPI(app as any);

export default app;