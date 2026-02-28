
export interface Container {
  register<T>(token: Token<T>, factory: Factory<T>): void;
  resolve<T>(token: Token<T>): T;

  _debugTokens?(): symbol[];
}

type Token<T> = symbol;
type Factory<T> = (container: Container) => T;

export default function createContainer(): Container {
  const factories = new Map<symbol, Factory<any>>();

  const container: Container = {
    register<T>(token: symbol, factory: Factory<T>) {
      if (typeof factory !== "function") {
        throw new Error(
          `DI register failed: factory for ${token.toString()} is not a function`
        );
      }
      factories.set(token, factory);
    },

    resolve<T>(token: symbol): T {
      const factory = factories.get(token);

      if (!factory) {
        throw new Error(
          `DI resolve failed: ${token.toString()} not registered`
        );
      }

      return factory(container);
    },

    _debugTokens() {
      return Array.from(factories.keys());
    },
  };
console.log("🆕 Container created");
  return container;
}