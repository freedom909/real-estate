// services/DB/initMongoContainer.js

import connectToMongoDB from './connectMongoDB.js';

const initMongoContainer = async () => {
  try {
    const connection = await connectToMongoDB();
    console.log('MongoDB Database connected via Mongoose');
    return connection;
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    throw err;
  }
};

export default initMongoContainer;