// models/user.js
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export const Role = {
  USER: 'USER',
  AGENT: 'AGENT',
  ADMIN: 'ADMIN',
  GUEST: 'GUEST',
  PENDING_AGENT: 'PENDING_AGENT'
};

const userSchema = new mongoose.Schema(
  {
    email: { type: String, index: true, sparse: true },
    password: { type: String },
    fullname: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    phone: { type: String },
    picture: { type: String },

    provider: {
      type: String,
      default: 'local',
    },
    sub: { type: String },

    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.USER,
      required: true
    },

    // Host / verification related
    agentStatus: {
      type: String,
      enum: ['NOT_APPLIED', 'PENDING', 'APPROVED', 'REJECTED'],
      default: 'NOT_APPLIED',
    },

    agentVerification: {
      frontKey: { type: String },
      backKey: { type: String },
      selfieKey: { type: String },
      submittedAt: { type: Date },
      reviewedAt: { type: Date },
      reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      result: { type: String } // optional (e.g., 'approved' or 'rejected')
    },

    kycVerified: { type: Boolean, default: false, required: true },

    version: { type: Number, default: 0 }
  },
  { timestamps: true }
);

userSchema.pre('validate', function(next) {
  if (!this.sub) this.sub = uuidv4();
  next();
});

const UserModel = mongoose.models.User || mongoose.model('User', userSchema);
export default UserModel;