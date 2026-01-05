// adapters/user-subgraph.client.js
import fetch from "node-fetch";

const USER_SUBGRAPH_URL = "http://localhost:4020/graphql";

export class UserSubgraphClient {
  async findUserByEmail(email) {
    const query = `
      query ($email: String!) {
        userByEmail(email: $email) {
          id
          email
          role
        }
      }
    `;

    const res = await this.#call(query, { email });
    return res?.userByEmail ?? null;
  }

  async createUser(input) {
    const mutation = `
      mutation ($input: CreateUserInput!) {
        createUser(input: $input) {
          id
          email
          role
        }
      }
    `;

    const res = await this.#call(mutation, { input });
    return res.createUser;
  }

  async #call(query, variables) {
    const res = await fetch(USER_SUBGRAPH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables }),
    });

    const json = await res.json();

    if (json.errors) {
      throw new Error(json.errors[0].message);
    }

    return json.data;
  }
}
