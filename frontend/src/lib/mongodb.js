// src/lib/mongodb.js
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI||"mongodb://localhost:27017");
const clientPromise = client.connect();

export default clientPromise;
