// src/subgraphs/user/services/user.service.ts
import * as EmailValidator from 'email-validator';
import { Role } from "../../../shared/types/role";
import { AuthenticationError, ForbiddenError, UserInputError } from "../../../infrastructure/utils/errors";
export default class UserService {
    constructor(userRepo, permissionService) {
        this.userRepo = userRepo;
        this.permissionService = permissionService;
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
    async findById(id, context) {
        if (!context?.user) {
            throw new AuthenticationError('Authentication required');
        }
        // 参数验证
        if (!id || typeof id !== 'string' || !id.trim()) {
            throw new UserInputError('Invalid ID');
        }
        try {
            const user = await this.userRepo.findById(id);
            if (!user)
                return null;
            // 权限检查
            if (!context?.user) {
                throw new AuthenticationError('Authentication required');
            }
            if (context.user.role !== Role.ADMIN && context.user.profile.UserId !== user.profile.UserId) {
                throw new ForbiddenError('Access denied: Cannot access other users');
            }
            return user;
        }
        catch (error) {
            // 只封装未知异常，已知异常透传
            if (error instanceof UserInputError ||
                error instanceof AuthenticationError ||
                error instanceof ForbiddenError) {
                throw error; // 透传
            }
            // 未知错误（例如 Repo 抛错）
            throw new UserInputError('Failed to fetch user');
        }
    }
    async createOAuthUser({ email, profile }) {
        // 1️⃣ Fast path
        const existing = await this.userRepo.findByEmail(email);
        if (existing)
            return existing;
        // 2️⃣ Try create
        try {
            return await this.userRepo.create({
                role: Role.CUSTOMER,
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
