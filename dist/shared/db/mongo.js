//src/shared/db/mongo.ts
import mongoose from "mongoose";
export async function connectMongo(uri) {
    mongoose.set("strictQuery", true);
    const options = {
        serverSelectionTimeoutMS: 5000,
        autoIndex: true
    };
    await mongoose.connect(uri, options);
    console.log("🍃 MongoDB connected");
}
export default mongoose;
