import { IUser } from "../../../shared/types/user";
import { IUserDB } from "./user.model";

export function mapToDomain(user: IUserDB): IUser {
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
 