import { Schema, model } from "mongoose";
const oauthAccountSchema = new Schema({
    userId: { type: String, required: true },
    provider: { type: String, required: true },
    providerUserId: { type: String, required: true },
});
const OAuthAccountModel = model("OAuthAccount", oauthAccountSchema);
export default OAuthAccountModel;
