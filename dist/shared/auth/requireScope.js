// shared/auth/requireScope.ts
export function requireScope(requiredScopes = []) {
    return async (ctx, next) => {
        // REST: req.user
        // GraphQL: context.user
        const user = ctx?.user ||
            ctx?.req?.user ||
            ctx?.context?.user;
        if (!user) {
            throw new Error("UNAUTHENTICATED");
        }
        const userScopes = user.scopes || [];
        const hasScope = requiredScopes.every((scope) => userScopes.includes(scope));
        if (!hasScope) {
            throw new Error("FORBIDDEN");
        }
        await next();
    };
}
