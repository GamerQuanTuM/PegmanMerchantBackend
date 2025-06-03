import { pinoLogger } from "hono-pino";
import type { Level } from "pino";
import env from "../env";


export function logger(
  level: Level = "info",
  isPretty: boolean = env.NODE_ENV !== "production"
) {
  return pinoLogger({
    pino: {
      level,
      transport: isPretty
        ? {
            target: "pino-pretty",
            options: {
              colorize: true,
              translateTime: "SYS:standard",
              ignore: "pid,hostname",
            },
          }
        : undefined,
    },
    contextKey: "logger",
    http: {
      reqId: () => crypto.randomUUID(),
    },
  });
}