export default async function handler(req, res) {
  const { mutation, userId } = JSON.parse(req.body);

  const queryMap = {
    FORCE_VERIFY: `mutation { forceVerifyHost(userId: "${userId}") { id } }`,
    LOCK: `mutation { lockUser(userId: "${userId}") { id } }`,
    UNLOCK: `mutation { unlockUser(userId: "${userId}") { id } }`,
  };

  await fetch("http://localhost:4020/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: queryMap[mutation] })
  });

  res.json({ ok: true });
}
