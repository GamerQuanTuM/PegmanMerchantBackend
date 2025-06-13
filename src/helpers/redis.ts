import env from "../env";
import Redis from "ioredis";

const redis = new Redis({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
});

export const redisSet = async (key: string, value: string, ttl: number = 120) => {
    await redis.set(key, value, 'EX', ttl);
};

export const redisGet = async (key: string) => {
    return await redis.get(key);
}
