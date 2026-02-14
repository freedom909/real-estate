import { Schema, model } from 'mongoose';
const userProviderSchema = new Schema({
    userId: { type: String, required: true },
    provider: { type: String, required: true },
    providerUserId: { type: String, required: true },
});
const UserProviderModel = model("UserProvider", userProviderSchema);
export default UserProviderModel;
