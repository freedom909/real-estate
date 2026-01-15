export default function createContainer() {
  const factories = new Map();

  return {
    register(token, factory) {
      if (typeof factory !== "function") {
        throw new Error(
          `DI register failed: factory for ${token.toString()} is not a function`
        );
      }
      factories.set(token, factory);
    },

    resolve(token) {
      if (!factories.has(token)) {
        throw new Error(
          `DI resolve failed: ${token.toString()} not registered`
        );
      }
      return factories.get(token)();
    },

    // 👇 只读调试
    _debugTokens() {
      return Array.from(factories.keys()).map(String);
    },
  };
}
