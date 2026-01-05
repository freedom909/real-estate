// src/subgraphs/auth/adapters/user.http.client.js
import fetch from "node-fetch";

export default class HttpUserClient {
  constructor({ endpoint }) {
    this.endpoint = endpoint;
  }

  async findUserByEmail(email) {
    if (!email) {
      throw new Error("HttpUserClient.findUserByEmail: email is required");
    }

    const query = `
      query ($email: String!) {
        findUserByEmail(email: $email) {
          id
          email
          role
        }
      }
    `;

    const res = await fetch(this.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        variables: { email },
      }),
    });

    const json = await res.json();

    if (json.errors) {
      throw new Error(json.errors[0].message);
    }

    return json.data.findUserByEmail;
  }
}
