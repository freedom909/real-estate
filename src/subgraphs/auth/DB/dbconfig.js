// import mysql from 'mysql2/promise';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

// let pool;
let mongodb;

const dbConfig = {

  mongo: async () => {
    if (!mongodb) {
      const client = await MongoClient.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/', {

      });
      mongodb = client.db(process.env.DB_NAME || 'real-estate');
      console.log('Connected to MongoDB');
    }
    return mongodb;
  },
};

export default dbConfig;
