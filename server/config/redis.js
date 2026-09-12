import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => {
      return Math.min(retries * 100, 3000);
    },
    keepAlive: 10000,
    connectTimeout: 10000,
  },
});

redisClient.on("error", (err) => {
  console.warn("Redis Client Warning (handled):", err.message || err);
});

redisClient.on("reconnecting", () => {
  console.log("Redis client reconnecting...");
});

redisClient.on("ready", () => {
  console.log("Redis client ready");
});

try {
  await redisClient.connect();
  console.log("Redis connected successfully");
} catch (err) {
  console.warn("Initial Redis connection failed (App will continue running):", err.message);
}

export default redisClient;
