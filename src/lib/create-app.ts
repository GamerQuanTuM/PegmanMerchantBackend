import { OpenAPIHono } from "@hono/zod-openapi";
import { defaultHook } from "stoker/openapi";
import { notFound, onError, serveEmojiFavicon } from "stoker/middlewares";
import { logger } from "../middlewares/pino-logger";

export default function createRouter<T extends Record<string, unknown> = {}>() {
    return new OpenAPIHono<T>({
      strict: false,
      defaultHook,
    });
  }
export function createApp() {
    const app = createRouter();

    app.use(serveEmojiFavicon("🔥"));
    app.use(logger(process.env.LOG_LEVEL as any));

    app.notFound(notFound);
    app.onError(onError);

    return app;
}
