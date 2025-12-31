// // src/subgraphs/auth/DB/initAuthContainer.js
// import { createContainer, asClass, asFunction, asValue } from "awilix";
// import bcrypt from "bcryptjs";
// import initMongoContainer from "./initMongoContainer.js";
// import OAuthService from "../services/oauth/oauth.service.js";
// import mockGoogleProvider from "../auth/oauth/providers/mock.provider.js";
// import RefreshTokenService from "../services/token/refreshRepo.js";

// import OAuthLoginAdapter from '../authService/oauthLoginAdapter.js';
// import UserService from "../../user/services/user.service.js";
// import TokenService from "../services/token/token.service.js";
// import UserRepository from "../repositories/userRepository.js";

// const initAuthContainer = async () => {
//   const container = createContainer();
//   const mongodb = await initMongoContainer();

//   container.register({
//     /* ---------- utils ---------- */
//     passwordHasher: asValue({
//       hash: bcrypt.hash,
//       compare: bcrypt.compare,
//     }),
//     mongodb: asValue(mongodb),
//     /* ---------- repositories ---------- */
//     userRepository: asClass(UserRepository).singleton(),

//     /* ---------- services ---------- */
//     userService: asClass(UserService).singleton(),
//     tokenService: asClass(TokenService).singleton(),
//     refreshTokenService: asClass(RefreshTokenService).singleton(),

//     /* ---------- OAuth providers (核心！) ---------- */
//     providers: asValue({
//       GOOGLE: mockGoogleProvider,
//       GITHUB: mockGoogleProvider,
//       FACEBOOK: mockGoogleProvider,
//     }),

//     /* ---------- OAuthService ---------- */
//     oauthService: asClass(OAuthService).singleton(),
//    oauthLoginAdapter: asClass(OAuthLoginAdapter).singleton(),
//   });

//   console.log("✅ Auth container initialized (DEBUG MODE)");
//   return container;
// };

// export default initAuthContainer;