import { IUser } from "@/domain/user/types/user";
import { IUserDBObject } from "../repos/user.repo";

export function mapToDomain(user: IUserDBObject): IUser {
  return {
    id: user._id.toString(),

    profile: {
      userId: user.profile.userId,   // ✅ correct case
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