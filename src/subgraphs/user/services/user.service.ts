// src/subgraphs/user/services/user.service.ts
import * as EmailValidator from 'email-validator';
import UserRepo from "../repos/user.repo";
import  { IUser, Role, UserDocument } from "../models/user.model";
import { AuthenticationError, ForbiddenError, UserInputError } from "../../../infrastructure/utils/errors";

export interface IContext {
  user?: IUser;
}

export default class UserService {
  private userRepo: UserRepo;

  constructor(userRepo: UserRepo) {
    if (!userRepo) {
      throw new Error("UserService: userRepo is required")
    }

    this.userRepo = userRepo
  }

async findByEmail(email: string): Promise<IUser | null> {
  if (!EmailValidator.validate(email)) {
    throw new UserInputError("Invalid email")
  }

  try {
    return await this.userRepo.findByEmail(email)
  } catch (err) {
    throw new UserInputError("Failed to fetch user")
  }
}

async findById(id: string, context: IContext) {
  try {
    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new UserInputError('Invalid ID');
    }

    if (!context?.user) {
      throw new AuthenticationError('Authentication required');
    }

    const user = await this.userRepo.findById(id);

    if (!user) return null;

    // 权限检查
    const isAdmin = context.user.role === Role.ADMIN;
    const isSelf = context.user.profile.UserId === id;

    if (!isAdmin && !isSelf) {
      throw new ForbiddenError(
        'Access denied: Cannot access other users'
      );
    }

    return user;

  } catch (error) {
    if (
      error instanceof UserInputError ||
      error instanceof AuthenticationError ||
      error instanceof ForbiddenError
    ) {
      throw error;
    }

    // 统一转换数据库错误
    throw new UserInputError('Failed to fetch user');
  }
}


  async createOAuthUser({ email, profile }: { email: string; profile: any }): Promise<IUser> {
    // 1️⃣ Fast path
    const existing = await this.userRepo.findByEmail(email);
    if (existing) return existing;

    // 2️⃣ Try create
    try {
      return await this.userRepo.create({

        role: Role.USER,
        status: "ACTIVE",
        profile: {
          UserId: profile.id,
          email: profile.email,
          name: profile.name,
          avatar: profile.picture,
        },
      });
    } catch (err: any) {
      // 3️⃣ Handle race condition
      if (err.code === 11000) {
        return await this.userRepo.findByEmail(email);
      }
      throw err;
    }
  }

  async deactivate(userId: string): Promise<boolean> {
    await this.userRepo.deactivate(userId);//
    return true;
  }
}