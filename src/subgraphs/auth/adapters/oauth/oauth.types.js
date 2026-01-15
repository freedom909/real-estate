// adapters/oauth/oauth.types.js
export const OAuthProvider = {
  GOOGLE: "google",
  GITHUB: "github",
};


/**
 * @typedef {Object} OAuthProfile
 * @property {string} provider
 * @property {string} providerUserId
 * @property {string=} email
 * @property {string=} name
 * @property {string=} avatar
 */
