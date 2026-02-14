// infrastructure/auth/authenticatedDataSource.ts
import {  GraphQLDataSourceProcessOptions,RemoteGraphQLDataSource } from "@apollo/gateway";
import { GraphQLRequest } from "@apollo/server";

interface Context {
  req?: {
    headers?: {
      [key: string]: string;
    };
  };
}



export default class AuthenticatedDataSource extends RemoteGraphQLDataSource {
  override willSendRequest(
    options: GraphQLDataSourceProcessOptions<Context>
  ) {
    const { request, context } = options;

    const cookie = context.req?.headers?.cookie;

    if (cookie) {
      request.http?.headers.set('cookie', cookie);
    }
  }
}
