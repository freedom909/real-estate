// import mongoose from 'mongoose'

// const UserSchema = new mongoose.Schema(
//   {
//     email: { type: String, required: true, unique: true },
//     emailVerified: { type: Boolean, default: true },
//     role: { type: String, enum: ['ADMIN','AGENT','USER','GUEST','PENDING_AGENT'], default: 'USER' },
//     name: String,
//     avatar: String
//   },
//   { timestamps: true }
// )

// export default mongoose.model('User', UserSchema)
import mongoose from "mongoose";

const OAuthUserSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },

    email: { type: String },
    fullname: String,
    picture: String,

    provider: { type: String, required: true },
    providerSub: { type: String, required: true },

    role: { type: String, default: "USER" },
  },
  { timestamps: true }
);

OAuthUserSchema.index({ provider: 1, providerSub: 1 }, { unique: true });

export default mongoose.models.OAuthUser ||
  mongoose.model("OAuthUser", OAuthUserSchema);
