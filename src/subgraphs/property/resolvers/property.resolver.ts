// src/subgraphs/property/resolvers/property.resolver.ts
import { GraphQLError } from "graphql";
import { randomUUID } from "crypto";

interface User {
  userId: string;
  role: string;
  [key: string]: any;
}

interface RequestContext {
  headers: {
    [key: string]: string | string[] | undefined;
  };
  [key: string]: any;
}

interface SecurityService {
  evaluate(event: any): Promise<any>;
}

interface SecurityAuditService {
  flag(result: any): void;
  recordOutcome(outcome: any): void;
}

interface PropertyService {
  create(propertyData: any): Promise<any>;
}

interface Metrics {
  requestRate: number;
  recentActions: any[];
}

interface Context {
  user?: User;
  req: RequestContext;
  securityService: SecurityService;
  securityAudit: SecurityAuditService;
  propertyService: PropertyService;
  metrics: Metrics;
  requestId?: string;
}

interface CreatePropertyParams {
  input: {
    [key: string]: any;
  };
}

let PROPERTIES: any[] = [];

const resolvers = {
  Mutation: {
    createProperty: async (_, { input }: CreatePropertyParams, ctx: Context) => {
      if (!ctx.user) {
        throw new GraphQLError("Unauthorized", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }
      
      const securityEvent = {
        eventId: randomUUID(),
        action: "CREATE_PROPERTY",
        actor: {
          userId: ctx.user.userId,
          role: ctx.user.role,
          isAuthenticated: true,
        },
        context: {
          ip: ctx.user.ip,
          userAgent: ctx.req.headers['user-agent'],
          requestId: ctx.requestId || randomUUID(),
        },
        resource: {
          type: 'PROPERTY',
          id: null, // ID not generated yet
        },
        signals: {
          requestRate: ctx.metrics.requestRate,
          recentActions: ctx.metrics.recentActions,
        }
      }
      
      const securityResult = await ctx.securityService.evaluate(securityEvent);
      if (!securityResult.allowed) {
        throw new GraphQLError("Forbidden", {
          extensions: { code: "FORBIDDEN" },
        });
      }
      if (securityResult.suggestedAction === "CHALLENGE") {
        throw new GraphQLError("Challenge", {
          extensions: { code: "CHALLENGE" },
        });
      }
      if (securityResult.suggestedAction === "FLAG") {
        ctx.securityAudit.flag(securityResult);
      }
      
      const property = await ctx.propertyService.create({
        ...input,
        ownerId: ctx.user.userId,
      });
      
      /**
       * 5️⃣ 记录安全结果（闭环）
       */
      ctx.securityAudit.recordOutcome(
        {
          eventType: 'CREATE_PROPERTY',
          actor: ctx.user.userId,
          success: true,
          risk: securityResult
        }
      );
      
      return property;
    }
  },
  Query: {
    properties: () => PROPERTIES,
  },
}

export default resolvers;