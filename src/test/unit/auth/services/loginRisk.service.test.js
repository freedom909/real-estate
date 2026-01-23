import { describe, it, expect } from "@jest/globals";
import request from "supertest";

// ⚠️ Configuration: Update this URL to point to your running test server
// If you have a setup file that exports the app, import it here.
const GRAPHQL_URL = process.env.TEST_SERVER_URL || "http://localhost:4000/graphql";

describe("E2E: Login -> Refresh -> Reuse Flow", () => {
  // Queries & Mutations
  const LOGIN_MUTATION = `
    mutation Login($email: String!, $password: String!) {
      login(email: $email, password: $password) {
        accessToken
        refreshToken
      }
    }
  `;

  const REFRESH_MUTATION = `
    mutation RefreshToken($refreshToken: String!) {
      refreshToken(refreshToken: $refreshToken) {
        accessToken
        refreshToken
      }
    }
  `;

  const ME_QUERY = `
    query Me {
      me {
        id
        email
      }
    }
  `;

  // Test User (Ensure this user exists in your seeded test DB)
  const TEST_USER = {
    email: "test@example.com",
    password: "password123",
  };

  it("should execute the full refresh token rotation and reuse detection lifecycle", async () => {
    // 1. Login to get initial tokens
    const loginRes = await request(GRAPHQL_URL)
      .post("/")
      .send({
        query: LOGIN_MUTATION,
        variables: TEST_USER,
      });

    // Check for login success
    if (loginRes.body.errors) {
      console.error("Login failed:", JSON.stringify(loginRes.body.errors, null, 2));
    }
    expect(loginRes.body.errors).toBeUndefined();
    
    const { accessToken: at1, refreshToken: rt1 } = loginRes.body.data.login;
    expect(at1).toBeDefined();
    expect(rt1).toBeDefined();

    // 2. Perform a legitimate Refresh (Rotation)
    const refreshRes1 = await request(GRAPHQL_URL)
      .post("/")
      .send({
        query: REFRESH_MUTATION,
        variables: { refreshToken: rt1 },
      });

    expect(refreshRes1.body.errors).toBeUndefined();
    const { accessToken: at2, refreshToken: rt2 } = refreshRes1.body.data.refreshToken;
    
    // Verify rotation
    expect(rt2).not.toBe(rt1);
    expect(at2).not.toBe(at1);

    // 3. Verify the new Access Token works
    const meRes = await request(GRAPHQL_URL)
      .post("/")
      .set("Authorization", `Bearer ${at2}`)
      .send({ query: ME_QUERY });

    expect(meRes.body.errors).toBeUndefined();
    expect(meRes.body.data.me).toBeDefined();

    // 4. 🚨 ATTACK SIMULATION: Reuse the OLD Refresh Token (rt1)
    const reuseRes = await request(GRAPHQL_URL)
      .post("/")
      .send({
        query: REFRESH_MUTATION,
        variables: { refreshToken: rt1 },
      });

    // Expect the server to catch this and throw an error
    expect(reuseRes.body.errors).toBeDefined();
    const errorMsg = reuseRes.body.errors[0].message;
    // Matches "Refresh token reuse detected" or "Token revoked" depending on exact error masking
    expect(errorMsg).toMatch(/reuse|revoked|invalid/i);

    // 5. Verify Consequence: The NEW Refresh Token (rt2) should now be revoked (Family Revocation)
    const refreshRes2 = await request(GRAPHQL_URL)
      .post("/")
      .send({
        query: REFRESH_MUTATION,
        variables: { refreshToken: rt2 },
      });

    expect(refreshRes2.body.errors).toBeDefined();
    expect(refreshRes2.body.errors[0].message).toMatch(/revoked|invalid/i);
  });
});
