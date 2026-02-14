import dotenv from "dotenv";
dotenv.config();
import { GraphQLClient } from "graphql-request";
export function createUserGraphQLClient() {
    const url = process.env.USER_SUBGRAPH_URL;
    if (!url) {
        throw new Error("USER_SUBGRAPH_URL is not defined"); //"Error: USER_SUBGRAPH_URL is not defined",
    }
    return new GraphQLClient(process.env.USER_SUBGRAPH_URL, {
        headers: {
            "content-type": "application/json",
        },
    });
}
