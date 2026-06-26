import 'dotenv/config';
import { createClient } from "redis";

export const redisClient = createClient({
  url: `redis://:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));

export const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log("Redis connected successfully");
  } catch (error) {
    console.error("Could not connect to Redis", error);
  }
};
