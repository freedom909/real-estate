import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongo: MongoMemoryServer;

beforeAll(async () => {
  jest.setTimeout(30000); // 👈 important for CI

  mongo = await MongoMemoryServer.create({
    binary: {
      version: "6.0.6", // 👈 pin version for CI stability
    },
  });

  const uri = mongo.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongo) {
    await mongo.stop();
  }
});