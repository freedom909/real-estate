import { MongoMemoryServer } from "mongodb-memory-server";

export default async () => {
  const mongo = await MongoMemoryServer.create({
    binary: { version: "6.0.6" },
  });

  process.env.MONGO_URI = mongo.getUri();
  (global as any).__MONGO__ = mongo;
};