// src/subgraphs/user/services/user.service.ts

import UserRepo from "../repos/user.repo.js";
import { IUser, Role } from "../models/user.model.js";

export default class UserService {
  private userRepo: UserRepo;

  constructor(userRepo: UserRepo) {
    if (!userRepo) {
      throw new Error("UserService: userRepo is required")
    }

    this.userRepo = userRepo
  }

  async findByEmail(email: string): Promise<IUser | null> {
    if (!this) throw new Error("this is undefined")
    if (!this.userRepo) throw new Error("userRepo not injected")
    if (!this.userRepo.findByEmail) throw new Error("findByEmail missing")
    return this.userRepo.findByEmail(email)
  }

  async findById(id: string): Promise<IUser | null> {
    return this.userRepo.findById(id);// is not a function
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