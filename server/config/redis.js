import { createClient, SchemaFieldTypes } from "redis";

const redisUrl = process.env.REDIS_URL;

const redisClient = createClient({
  url: redisUrl || undefined,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 5 && !redisUrl) return false;
      return Math.min(retries * 100, 3000);
    },
    connectTimeout: 5000,
  },
});

redisClient.on("error", (err) => {
  console.warn("Redis Client Warning (handled):", err.message || err);
});

redisClient.on("reconnecting", () => {
  console.log("Redis client reconnecting...");
});

redisClient.on("ready", async () => {
  console.log("Redis client ready");
  try {
    await redisClient.ft.create(
      "userIdIdx",
      {
        "$.userId": {
          type: SchemaFieldTypes.TAG,
          AS: "userId",
        },
      },
      {
        ON: "JSON",
        PREFIX: "session:",
      }
    );
    console.log("Redis index userIdIdx verified/created");
  } catch (err) {
    if (!err.message?.includes("Index already exists")) {
      console.warn("Notice on Redis index creation:", err.message);
    }
  }
});

try {
  if (redisUrl) {
    await redisClient.connect();
    console.log("Redis connected successfully");
  } else {
    console.warn("⚠️ REDIS_URL is not set in environment variables! Please configure REDIS_URL in Render.");
  }
} catch (err) {
  console.warn("Initial Redis connection failed:", err.message);
}

export default redisClient;
