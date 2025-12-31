// // src/shared/container/createContainer.js

// import { TOKENS } from "./tokens.js";

// function createContainer(deps = {}) {
//   /**
//    * deps 来自“外部世界”
//    * - userService（adapter）
//    * - refreshTokenRepo
//    * - tokenService
//    */

//   const container = new Map();

//   // 1️⃣ register userService（来自 adapter）
//   if (!deps.userService) {
//     throw new Error("userService is required");// 
//   }
//   container.set(TOKENS.userService, deps.userService);

//   // 2️⃣ tokenService
//   if (!deps.tokenService) {
//     throw new Error("tokenService is required");
//   }
//   container.set(TOKENS.tokenService, deps.tokenService);

//   // 3️⃣ refreshTokenService（组合依赖）
//   if (deps.refreshTokenService) {
//     container.set(
//       TOKENS.refreshTokenService,
//       deps.refreshTokenService
//     );
//   }

//   return {
//     get(token) {
//       if (!container.has(token)) {
//         throw new Error(`Dependency not found: ${token.toString()}`);
//       }
//       return container.get(token);
//     },
//   };
// }
// export default createContainer;

// src/shared/container/createContainer.js
export default function createContainer() {
  const registry = new Map();

  return {
    register(token, factory) {
      registry.set(token, factory);
    },
    resolve(token) {
      if (!registry.has(token)) {
        throw new Error(`Dependency not registered: ${String(token)}`);
      }
      return registry.get(token)();
    },
  };
}
