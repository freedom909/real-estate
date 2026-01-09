import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    emailVerified: { type: Boolean, default: true },
    role: { type: String, enum: ['ADMIN','AGENT','USER','GUEST','PENDING_AGENT'], default: 'USER' },
    name: String,
    avatar: String
  },
  { timestamps: true }
)

export default mongoose.model('User', UserSchema)
