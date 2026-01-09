import mongoose from 'mongoose'

const credentialSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['password','oauth'], required: true },
  provider: { type: String }, // only for oauth
  providerUserId: { type: String }, // only for oauth
  email: { type: String }, // only for password
  passwordHash: { type: String }, // only for password
}, { timestamps: true })

credentialSchema.index({ provider: 1, providerUserId: 1 }, { unique: true, sparse: true })
credentialSchema.index({ type: 1, email: 1 }, { unique: true, sparse: true })

export default mongoose.model('Credential', credentialSchema)
