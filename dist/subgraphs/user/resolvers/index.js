// src/subgraphs/user/resolvers/index.ts
import { Action, Resource } from "@/shared/types/types";
import { TOKENS } from "../../../shared/container/tokens";
import { ForbiddenError } from "@/infrastructure/utils/errors";
export default {
    Query: {
        userById: async (_, { id }, { container, user }) => {
            const policyEngine = container.resolve(TOKENS.security.policyEngine);
            const userService = container.resolve(TOKENS.user.userService);
            const targetUser = await userService.findById(id);
            if (targetUser) {
                return null;
            }
            const policyContext = {
                user: user ? { id: user.id, role: user.role } : undefined,
                resourceOwnerId: targetUser.id
            };
            const allowed = policyEngine.can(Action.READ, Resource.USER, {
                user: policyContext.user ?? undefined,
                resourceOwnerId: targetUser.id
            });
            if (!allowed) {
                throw new ForbiddenError("Access denied");
            }
            return targetUser;
        },
        userByEmail: (_, { email }, { container }) => container
            .resolve(TOKENS.user.userService)
            .findByEmail(email),
    },
    User: {
        async __resolveReference(ref, { container }) {
            const userService = container.resolve(TOKENS.user.userService);
            return userService.findById(ref.id);
        }
    },
    Mutation: {
        createOAuthUser: (_, { input }, { container }) => {
            console.log("🔥 USER SUBGRAPH RESOLVER HIT");
            console.log("resolver hit");
            const userService = container
                .resolve(TOKENS.user.userService);
            return userService.createOAuthUser(input);
        },
        deactivateUser: (_, { userId }, { services }) => services.userService.deactivate(userId),
    },
};
