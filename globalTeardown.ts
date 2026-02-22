export default async () => {
  const mongo = (global as any).__MONGO__;
  if (mongo) {
    await mongo.stop();
  }
};