
import { RemoteGraphQLDataSource } from "@apollo/gateway";
export default class AuthenticatedDataSource extends RemoteGraphQLDataSource {
  willSendRequest({ request, context }) {
    if (context.user) {
      request.http.headers.set(
        "x-user",
        JSON.stringify(context.user)
      );
    }
  }
}


