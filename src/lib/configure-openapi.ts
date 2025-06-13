import { Scalar } from "@scalar/hono-api-reference";
import type { AppOpenAPI } from "../types";

import packageJson from "../../package.json"

export default function configureOpenAPI(app: AppOpenAPI) {
    app.doc("/doc", {
        openapi: "3.0.0",
        info: {
            title: "Pegman API",
            version: packageJson.version,
            description: "This is the Backend for Pegman.",
        },
    })

    app.get("/reference", Scalar({
        url: "/doc",
        theme: 'solarized',
        layout: "classic",
        defaultHttpClient: {
            targetKey: "javascript",
            clientKey: "fetch"
        }
    }))
}