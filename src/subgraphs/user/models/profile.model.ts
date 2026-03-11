//src/subgraphs/user/models/profile.models.ts
import mongoose from "mongoose"
const { Schema } = mongoose

const profileSchema = new Schema({
    phone: {
    type: String,
    required: false,
    },
    address: {
    type: String,
    required: false,
    },

  },
  {
    timestamps: true,
  }
)
const ProfileModel = mongoose.model("Profile", profileSchema)
export default ProfileModel