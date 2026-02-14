// src/subgraphs/auth/oauth/verifiers/google.idtoken.ts
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
const jwks = jwksClient({
    jwksUri: 'https://www.googleapis.com/oauth2/v3/certs',
});
function getKey(header, callback) {
    jwks.getSigningKey(header.kid, (err, key) => {
        if (err)
            return callback(err);
        callback(null, key.getPublicKey());
    });
}
export default async function verifyGoogleIdToken(idToken) {
    try {
        const verifyOptions = {
            audience: process.env.GOOGLE_CLIENT_ID,
            issuer: ['https://accounts.google.com', 'accounts.google.com'],
        };
        const payload = await new Promise((resolve, reject) => {
            jwt.verify(idToken, getKey, verifyOptions, (err, decoded) => {
                if (err)
                    reject(err);
                else
                    resolve(decoded);
            });
        });
        return {
            provider: 'GOOGLE',
            providerUserId: payload.sub,
            email: payload.email,
            name: payload.name,
            avatar: payload.picture,
        };
    }
    catch (err) {
        throw new Error('INVALID_GOOGLE_ID_TOKEN');
    }
}
