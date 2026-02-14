// shared/auth/requireScope.ts

interface User {
  scopes?: string[];
  [key: string]: any;
}

interface Context {
  user?: User;
  req?: {
    user?: User;
  };
  context?: {
    user?: User;
  };
}

interface NextFunction {
  (): Promise<any>;
}

export function requireScope(requiredScopes: string[] = []): (ctx: Context, next: NextFunction) => Promise<void> {
  return async (ctx: Context, next: NextFunction) => {
    // REST: req.user
    // GraphQL: context.user
    const user: User | undefined =
      ctx?.user ||
      ctx?.req?.user ||
      ctx?.context?.user;

    if (!user) {
      throw new Error("UNAUTHENTICATED");
    }

    const userScopes: string[] = user.scopes || [];

    const hasScope = requiredScopes.every(
      (scope) => userScopes.includes(scope)
    );

    if (!hasScope) {
      throw new Error("FORBIDDEN");
    }

    await next();
  };
}