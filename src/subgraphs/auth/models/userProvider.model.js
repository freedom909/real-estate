import mongoose from 'mongoose'

const UserProviderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    provider: {
      type: String,
      enum: ['google', 'github', 'line', 'apple'],
      required: true
    },
    providerUserId: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
)

UserProviderSchema.index(
  { provider: 1, providerUserId: 1 },
  { unique: true }
)

UserProviderSchema.index(
  { userId: 1, provider: 1 },
  { unique: true }
)

export default mongoose.model('UserProvider', UserProviderSchema)
