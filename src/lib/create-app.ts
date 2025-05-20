import { OpenAPIHono } from "@hono/zod-openapi";
import { defaultHook } from "stoker/openapi";
import { notFound, onError, serveEmojiFavicon } from "stoker/middlewares";
import { AppBindings } from "@/types";

export default function createRouter() {
    return new OpenAPIHono<AppBindings>({
        strict: false,
        defaultHook,
    });
}

export function createApp() {
    const app = createRouter();

    app.use(serveEmojiFavicon("🔥"));

    app.notFound(notFound);
    app.onError(onError);

    return app;
}
