
const config = {
    google: {
        clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
        redirectUri: process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI || 'http://localhost:3000/auth/callback'
    },
    facebook: {
        clientId: process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID,
        clientSecret: process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_SECRET,
        redirectUri: process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI || 'http://localhost:3000/auth/callback'
    },
    github: {
        clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
        clientSecret: process.env.NEXT_PUBLIC_GITHUB_CLIENT_SECRET,
        redirectUri: process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI || 'http://localhost:3000/auth/callback'
    }
};

const SUBGRAPH_AUTH_URL = process.env.NEXT_PUBLIC_SUBGRAPH_AUTH_URL || 'http://localhost:4010/graphql';
console.log('SUBGRAPH_AUTH_URL:', SUBGRAPH_AUTH_URL);

export default config;