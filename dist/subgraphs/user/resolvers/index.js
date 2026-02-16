import { TOKENS } from "../../../shared/container/tokens.js";
export default {
    Query: {
        userById: (_, { id }, { container }) => container
            .resolve(TOKENS.user.userService)
            .findById(id),
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
