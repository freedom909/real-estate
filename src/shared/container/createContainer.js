

// src/shared/container/createContainer.js
export default function createContainer() {
 

  const registry = new Map();

  return {
    register(token, factory) {
       
      registry.set(token, factory);
    },
    

    resolve(token) {
      console.log("Resolving:", token.toString());
      if (!registry.has(token)) {
        throw new Error(`Dependency not registered: ${String(token)}`);
      }
      return registry.get(token)();
    },
  };
}
