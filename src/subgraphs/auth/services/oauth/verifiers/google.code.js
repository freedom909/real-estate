// src/subgraphs/auth/oauth/verifiers/google.code.js

import axios from 'axios';

export default async function verifyGoogleCode(code) {
  const tokenRes = await axios.post(
    'https://oauth2.googleapis.com/token',
    {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code',
    },
    { headers: { 'Content-Type': 'application/json' } }
  );

  const { id_token } = tokenRes.data;

  // 统一复用 ID Token verifier
  const verifyGoogleIdToken = (await import('./google.idtoken.js')).default;
  return verifyGoogleIdToken(id_token);
}
