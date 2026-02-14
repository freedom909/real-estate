// infrastructure/auth/authenticatedDataSource.ts
import { RemoteGraphQLDataSource } from "@apollo/gateway";
export default class AuthenticatedDataSource extends RemoteGraphQLDataSource {
    willSendRequest(options) {
        const { request, context } = options;
        const cookie = context.req?.headers?.cookie;
        if (cookie) {
            request.http?.headers.set('cookie', cookie);
        }
    }
}
