import { defaultFieldResolver, GraphQLError, GraphQLSchema, GraphQLFieldConfig, GraphQLObjectType } from "graphql";
import { mapSchema, getDirective, MapperKind } from "@graphql-tools/utils";

interface DirectiveArgs {
  [argName: string]: any;
}

interface GraphQLContext {
  user?: any;
  [key: string]: any;
}

interface GraphQLResolveInfo {
  [key: string]: any;
}

export function authDirectiveTransformer(schema: GraphQLSchema) {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig: GraphQLFieldConfig<any, any, any>, fieldName: string, typeName: string, schema: GraphQLSchema) => {
      // 安全跳过 federation / introspection 字段
      if (
        fieldName?.startsWith("_") ||
        typeName?.startsWith("_")
      ) {
        return fieldConfig;
      }

      const authDirective = getDirective(schema, fieldConfig, "auth")?.[0];
      if (!authDirective) {
        return fieldConfig;
      }

      const { resolve = defaultFieldResolver } = fieldConfig;

      fieldConfig.resolve = function (parent: any, args: any, context: GraphQLContext, info: GraphQLResolveInfo) {
        if (!context.user) {
          throw new GraphQLError("Unauthorized");
        }
        return resolve!.call(this, parent, args, context, info);
      };

      return fieldConfig;
    }
  });
}