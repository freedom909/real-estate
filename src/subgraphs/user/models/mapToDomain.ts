import { IUser } from "@/shared/types/user";
import { IUserDB, UserDocument } from "./user.model";
import { Types } from "mongoose";
type IUserDBObject = IUserDB & { _id: Types.ObjectId };
export function mapToDomain(user: IUserDBObject): IUser {
  return {
    id: user._id.toString(),
    profile: {
      UserId: user.profile.UserId,
      email: user.profile.email,
      name: user.profile.name,
      avatar: user.profile.avatar,
    },
    role: user.role,
    status: user.status,
    tokenVersion: user.tokenVersion,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
 