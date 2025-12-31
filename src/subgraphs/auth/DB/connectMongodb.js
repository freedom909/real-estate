import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

export default async function connectToMongoDB(mongoUri) {
    console.log("MONGO_URI:", mongoUri);
    try {
        if (mongoUri) {
            const MONGO_URI = mongoUri || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/real-estate';
            console.log("Loading MONGO_URI from env:", process.env.MONGO_URI);
            await mongoose.connect(MONGO_URI, {
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000
            });

            console.log('✅ Connected to MongoDB via Mongoose');
            return mongoose.connection;
        }





    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);
        throw error;
    }
}