import { createApp } from "./lib/create-app.js";
import configureOpenAPI from "./lib/configure-openapi.js";
import healthcheck from "./routes/index.route"
import authRouter from "./routes/auth/auth.index";
import ownerRouter from "./routes/owner/owner.index";
// import { elasticsearchMiddleware } from "./helpers/elastic-search.js";


const app = createApp();

// app.use("*", elasticsearchMiddleware({
//     node: "http://localhost:9200"
// }))


const routes = [
    healthcheck,
    authRouter,
    ownerRouter
] as const;

routes.forEach((route) => {
    app.route("/", route);
})

configureOpenAPI(app);

export default app;