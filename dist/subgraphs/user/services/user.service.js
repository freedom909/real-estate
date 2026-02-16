// src/subgraphs/user/services/user.service.ts
import * as EmailValidator from 'email-validator';
import { Role } from "../models/user.model";
import { UserInputError } from "../../../infrastructure/utils/errors";
export default class UserService {
    constructor(userRepo) {
        if (!userRepo) {
            throw new Error("UserService: userRepo is required");
        }
        this.userRepo = userRepo;
    }
    async findByEmail(email) {
        if (!EmailValidator.validate(email)) {
            throw new UserInputError("Invalid email");
        }
        try {
            return await this.userRepo.findByEmail(email);
        }
        catch (err) {
            throw new UserInputError("Failed to fetch user");
        }
    }
    async findById(id) {
        return this.userRepo.findById(id); // is not a function
    }
    async createOAuthUser({ email, profile }) {
        // 1️⃣ Fast path
        const existing = await this.userRepo.findByEmail(email);
        if (existing)
            return existing;
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
        }
        catch (err) {
            // 3️⃣ Handle race condition
            if (err.code === 11000) {
                return await this.userRepo.findByEmail(email);
            }
            throw err;
        }
    }
    async deactivate(userId) {
        await this.userRepo.deactivate(userId); // 
        return true;
    }
}
