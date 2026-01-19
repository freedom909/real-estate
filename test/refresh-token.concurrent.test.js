import { describe, it, expect, beforeAll } from "@jest/globals";
import fetch from "node-fetch";

const GATEWAY_URL = "http://localhost:4000/graphql";

// ⚠️ 使用一个【已经登录】后拿到的 refresh token
// 建议你在 beforeAll 里手动登录一次
let refreshCookie;

beforeAll(async () => {
  // ⚠️ 这里假设你已经能拿到 refresh_token cookie
  // 最简单方式：手动粘一个
  refreshCookie =
    "refresh_token=PASTE_YOUR_REFRESH_TOKEN_HERE";
});

async function callRefresh() {
  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: refreshCookie,
    },
    body: JSON.stringify({
      query: `
        mutation {
          refreshToken {
            accessToken
            refreshToken
          }
        }
      `,
    }),
  });

  const json = await res.json();
  return json;
}

describe("🔁 Refresh token concurrent attack", () => {
  it("allows only ONE refresh to succeed", async () => {
    const results = await Promise.allSettled([
      callRefresh(),
      callRefresh(),
    ]);

    const successes = results.filter(
      (r) =>
        r.status === "fulfilled" &&
        r.value?.data?.refreshToken?.accessToken
    );

    const failures = results.filter(
      (r) =>
        r.status === "fulfilled" &&
        r.value?.errors?.[0]?.message?.includes(
          "refresh token reuse"
        )
    );

    console.log("✅ successes:", successes.length);
    console.log("❌ reuse errors:", failures.length);

    // 🔐 核心安全断言
    expect(successes.length).toBe(1);
    expect(failures.length).toBe(1);
  });
});
