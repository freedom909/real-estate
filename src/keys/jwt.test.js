import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

// 1️⃣ 读取公钥
const PUBLIC_KEY = fs.readFileSync(
  path.join(process.cwd(), "src/keys/public.pem"),
  "utf8"
);

// 2️⃣ 把你 GraphQL 返回的 accessToken 粘贴到这里
const accessToken = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEiLCJyb2xlIjoiVVNFUiIsImVtYWlsIjoidGVzdEBnbWFpbC5jb20iLCJpYXQiOjE3Njc2ODc5OTEsImV4cCI6MTc2NzY4ODg5MSwiaXNzIjoiYXV0aC1zZXJ2aWNlIn0.ANiMg_GEAcp_Gqs3tRJzYakggpA5Wl4Wj9hc2T6b3EnZXPsY6OpcCk9nbCa3SZIh5H3WUPJYhhuo9z_3h8HSgLAnoFLgvkBRRH1wF6ScIezwJMay01uOIROpAheepTYigQry4yDl84Q9lZAuVjMhnWAtiMPrYjxBIb3HbMb7TsyNMkpQanZLZago-uCCwYFg3JkbMbNNwWTHlU-YXhpuxwGwlRi2pE8r3M97u3JXSWp5wlBvCBUWgKz-Ct6DU8EC_e7_Pw9XVlKqzhrpJpWsSJbitQBzmJRXl-ZqUGOrxixazI_FKZ51Jr1wV93RxQnmKADQcpFMXmQpC2DXWxqzeg".
      
trim();

try {
  const decoded = jwt.verify(accessToken, PUBLIC_KEY, {
    algorithms: ["RS256"],
  });

  console.log("✅ JWT is valid");
  console.log(decoded);
} catch (err) {
  console.error("❌ JWT verify failed");
  console.error(err);
}
