// src/subgraphs/user/resolvers/index.ts

import UserService from "@/application/user/services/user.service";
import { Action, Resource } from "../../../domain/user/types/types";
import { TOKENS } from "../../../shared/container/tokens";
import UserModel, { IUserDB } from "../models/user.model.js";
import { ForbiddenError } from "@/infrastructure/utils/errors";
import { container } from "tsyringe";
import PolicyEngine from "@/security/policy.engine";
import userService from "../services/user.service";
import mongoose from "mongoose";
interface ResolverContext {
  container: typeof container;
  services: any;
  user?: any;
}

interface UserReference {
  id: string;
  __typename?: string;
}

// user.resolver.ts

const resolvers = {

  User: {
    __resolveReference: async (ref: UserReference, { userService }: any) => {
      return await userService.findById(ref.id);
    },
  },
  Query: {
    user: async (_: unknown, { id }: { id: string }, { user }: ResolverContext) => {
      const policyEngine = container.resolve<PolicyEngine>(TOKENS.security.policyEngine);
      const userService = container.resolve<UserService>(TOKENS.user.services.userService);

      const targetUser = await userService.findById(id);

      if (!targetUser) {
        return null
      }

      const policyContext = {
        user: user ? { id: user.id, role: user.role } : undefined,
        resourceOwnerId: targetUser._id.toString()
      }
      const allowed = policyEngine.can(Action.READ,
        Resource.USER, {
        user: policyContext.user ?? undefined,
        resourceOwnerId: targetUser._id.toString(),
      })
      if (!allowed) {
        throw new ForbiddenError("Access denied");
      }
      return targetUser;
    },

    userByEmail: async (_: unknown, { email }: { email: string }) => {
      const userService = container.resolve<UserService>(TOKENS.user.services.userService);
      return userService.findByEmail(email);
    },
  },

  Mutation: {
    deactivateUser: async (
      _: unknown,
      { userId }: { userId: string }
    ) => {
      const userService = container.resolve<UserService>(TOKENS.user.services.userService);
      return userService.deactivate(userId);
    },

    createOAuthUser: async (_: any, { input }: any) => {

      console.log("🔥 createOAuthUser input =", input);

      try {

        const tenantId = new mongoose.Types.ObjectId();

        const user = await UserModel.create({
          tenantId,
          email: input.email,
          name: input.profile?.name || "unknown",
          avatar: input.profile?.avatar || "",
          role: "CUSTOMER"
        });

        console.log("✅ user created =", user);

        return {
          id: user._id.toString(),
          role: user.role,
          profile: {
            name: user.name,
            avatar: user.avatar,
            email: user.email
          }
        };

      } catch (err) {

        console.error("🔥 createOAuthUser DB ERROR =", err);

        throw err;
      }
    },
    updateLastLogin: async (_, { userId }) => {

      const user = await UserModel.findByIdAndUpdate(
        userId,
        { lastLoginAt: new Date() }
      )

      return !!user
    }
  },


}

export default resolvers;