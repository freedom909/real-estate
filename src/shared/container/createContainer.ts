interface Token {
  toString(): string;
}

interface Factory<T> {
  (): T;
}

export default function createContainer() {
  const factories = new Map<Token, Factory<any>>();

  return {
    register<T>(token: Token, factory: Factory<T>) {
      if (typeof factory !== "function") {
        throw new Error(
          `DI register failed: factory for ${token.toString()} is not a function`
        );
      }
      factories.set(token, factory);
    },

    resolve<T>(token: Token): T {
      if (!factories.has(token)) {
        throw new Error(
          `DI resolve failed: ${token.toString()} not registered`
        );
      }
      return factories.get(token)!();
    },

    // 👇 只读调试
    _debugTokens(): string[] {
      return Array.from(factories.keys()).map(token => token.toString());
    },
  };
}