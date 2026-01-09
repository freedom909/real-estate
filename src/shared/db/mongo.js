//src/shared/db/mongo.js
import mongoose from "mongoose";

export async function connectMongo(uri) {
  mongoose.set("strictQuery", true);

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });

  console.log("🍃 MongoDB connected");
}

export default mongoose;