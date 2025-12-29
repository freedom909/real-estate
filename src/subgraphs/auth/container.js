import { asClass, asValue } from "awilix";

container.register({
  authService: asClass(AuthService).scoped(),
  tokenService: asClass(TokenService).scoped(),

  googleOAuth: asValue(googleOAuth),
  facebookOAuth: asValue(facebookOAuth),
  githubOAuth: asValue(githubOAuth),
});
