import fetch from "node-fetch";

const AUTH_URL = "http://localhost:4010/graphql";

// ⚠️ 从 auth 服务日志里复制 refresh_token cookie
const COOKIE =
  "refresh_token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OTY4OThhZTU4OWQxNjFmOTkwMDU5ZmQiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc2ODcxMDczOSwiZXhwIjoxNzcxMzAyNzM5LCJpc3MiOiJhdXRoLXN1YmdyYXBoIn0.cHM9PsRLL1kckZOTaw79oXIVw3Dd7QkIprs4sr-lcSQztw2NnvpwcdA8iKjB-LI-EwlhE9xb72-wk3DqEQRrUO9qu00nmgWErne9VJqcQMj_Q6uLoXO4W-kCsvNNCkq0W7A3Rae-HwM1MVrHHX_eul-7n7ukYrzEn6WKT6V9DatXAqGNJsJ-b_62fE_xdAGgD82SA5sZkbLp8WG2K7dTDKyBaosAaVa2DY69kWXtQAH84QK0yBSoKv9KDlEfO5VbxcHPahqXMPRLozoBPnEwQKhoRXUXUdpZO1EK1Yybn6fsNK1Z8p-B2L-Hb1Lx7GtDKYmAplLLQ0bmqu72nOhfeg";

async function refresh() {
  const res = await fetch(AUTH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: COOKIE,
    },
    body: JSON.stringify({
      query: `
        mutation {
          refreshToken {
            accessToken
          }
        }
      `,
    }),
  });

  return res.json();
}

async function test() {
  const results = await Promise.allSettled([
    refresh(),
    refresh(),
  ]);

  console.log(JSON.stringify(results, null, 2));
}

test();
