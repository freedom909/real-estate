// src/subgraphs/user/services/user.service.ts
import * as EmailValidator from 'email-validator';
import UserRepo from "../../../subgraphs/user/repos/user.repo";
import { IUserDB, UserDocument } from "../../../subgraphs/user/models/user.model";
import { Role } from "../../../domain/user/types/role";
import { AuthenticationError, ForbiddenError, UserInputError } from "../../../infrastructure/utils/errors";
import IPermissionService from "../../../security/permission.service";
import { IUser } from "../../../domain/user/types/user";

import { mapToDomain } from '../../../subgraphs/user/models/mapToDomain';

export interface IContext {
  user?: IUserDB;
}

export default class UserService {
  constructor(
    private readonly userRepo: UserRepo,
    private readonly permissionService: IPermissionService,
  ) { }

  async findByEmail(email: string): Promise<IUser| null> {
    if (!EmailValidator.validate(email)) {
      throw new UserInputError("Invalid email");
    }
    try {
      const userDB = await this.userRepo.findByEmail(email);
      if (!userDB) return null;
      return mapToDomain(userDB);
    }
    catch (error) {
      throw new UserInputError("Failed to fetch user");
    }
  }

  async findById(id: string, context?: IContext): Promise<IUserDB | null> {
    console.log("context:",context)
    console.log("context?.user:",context?.user)
    if (!context?.user) {
      throw new AuthenticationError('Authentication required');
    }
    // 参数验证
    if (!id || typeof id !== 'string' || !id.trim()) {
      throw new UserInputError('Invalid ID');
    }

    try {
      const user = await this.userRepo.findById(id);

      if (!user) return null;

      // 权限检查
      if (!context?.user) {
        throw new AuthenticationError('Authentication required');
      }

      if (context.user.role !== Role.ADMIN && context.user.profile.userId !== user.profile.userId) {
        throw new ForbiddenError('Access denied: Cannot access other users');
      }

      return user;
    } catch (error) {
      // 只封装未知异常，已知异常透传
      if (
        error instanceof UserInputError ||
        error instanceof AuthenticationError ||
        error instanceof ForbiddenError
      ) {
        throw error; // 透传
      }

      // 未知错误（例如 Repo 抛错）
      throw new UserInputError('Failed to fetch user');
    }
  }

  async createOAuthUser({ email, profile }: { email: string; profile: any }): Promise<IUserDB> {
    // 1️⃣ Fast path
    const existing = await this.userRepo.findByEmail(email);
    if (existing) return existing;

    // 2️⃣ Try create
    try {
      return await this.userRepo.create({

        role: Role.CUSTOMER,
        status: "ACTIVE",
        profile: {
          userId: profile.id,
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