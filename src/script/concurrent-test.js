import fetch from "node-fetch";

const ENDPOINT = "http://localhost:4020/graphql";// user subgraph is the 4020 port

const mutation = `
mutation FindOrCreateOAuthUser($input: OAuthUserInput!) {
  findOrCreateOAuthUser(input: $input) {
    userId
    email
  }
}
`;

const variables = {
  input: {
    email: "test@gmail.com",
    fullname: "Concurrent User",
    picture: "https://example.com/avatar.png",
    provider: "google",
    providerSub: "concurrent-123",
  },
};

async function sendRequest(i) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: mutation,
      variables,
    }),
  });

  const json = await res.json();

  console.log(`\n=== Request ${i} ===`);
  console.log(JSON.stringify(json, null, 2));

  return json;
}

async function main() {
  await Promise.all(
    Array.from({ length: 10 }, (_, i) => sendRequest(i + 1))
  );

  console.log("\n✅ All requests finished");
}

main();
