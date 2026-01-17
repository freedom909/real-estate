// infrastructure/auth/authenticatedDataSource.js
import { RemoteGraphQLDataSource } from "@apollo/gateway";

export default class AuthenticatedDataSource extends RemoteGraphQLDataSource {
  willSendRequest({ request, context }) {
    if (context.req?.headers?.cookie) {
      request.http.headers.set(
        "cookie",
        context.req.headers.cookie
      );
    }
  }
}
