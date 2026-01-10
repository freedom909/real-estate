// src/shared/container/createContainer.js

export default function createContainer() {
  const providers = new Map();
  const resolving = new Set();

  return {
    register(token, factory) {
      if (!token) {
        throw new Error("DI register failed: token is undefined");
      }
      if (!factory) {
  console.error("❌ DI token not registered:", token.toString());
}

      if (typeof factory !== "function") {
        throw new Error(
          `DI register failed: factory for ${token.toString()} is not a function`
        );
      }

      providers.set(token, factory);
    },

    resolve(token) {
      if (!token) {
        throw new Error("DI resolve failed: token is undefined");
      }

      if (!providers.has(token)) {
        throw new Error(`DI resolve failed: ${token.toString()} not registered`);
      }

      if (resolving.has(token)) {
        throw new Error(
          `Circular dependency detected while resolving ${token.toString()}`
        );
      }

      try {
        resolving.add(token);

        const instance = providers.get(token)();

        if (instance === undefined) {
          throw new Error(
            `DI resolve failed: ${token.toString()} factory returned undefined`
          );
        }

        return instance;
      } finally {
        resolving.delete(token);
      }
    },
  };
}
