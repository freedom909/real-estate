
import { Schema, model, HydratedDocument } from 'mongoose'


export interface UserProvider {
  userId: string;
  provider: 'google' | 'github' | 'line' | 'apple';
  providerUserId: string;
  createdAt: Date;
  updatedAt: Date;
}
const userProviderSchema = new Schema<UserProvider>({
  userId: { type: String, required: true },
  provider: { type: String, required: true },
  providerUserId: { type: String, required: true },
})

export type UserProviderDocument = HydratedDocument<UserProvider>

const UserProviderModel = model<UserProvider>(
  "UserProvider",
  userProviderSchema
)

export default UserProviderModel