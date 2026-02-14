import verifyGoogleIdToken from "./verifiers/google.id.js";
export default class OAuthVerifier {
    async verifyIdToken(provider, idToken) {
        switch (provider) {
            case "GOOGLE":
                return verifyGoogleIdToken(idToken);
            default:
                throw new Error("UNSUPPORTED_OAUTH_PROVIDER");
        }
    }
    async verify(provider, idToken) {
        const res = await this.verifyIdToken(provider, idToken);
        return {
            providerUserId: res.sub,
            email: res.email,
        };
    }
}
