import { defaultFieldResolver, GraphQLError } from "graphql";
import { mapSchema, getDirective, MapperKind } from "@graphql-tools/utils";


export function authDirectiveTransformer(schema) {
  return mapSchema(schema, {
  [MapperKind.OBJECT_FIELD]: (fieldConfig, fieldName, parentType) => {
  // 安全跳过 federation / introspection 字段
  if (
    fieldName?.startsWith("_") ||
    parentType?.name?.startsWith("_")
  ) {
    return fieldConfig;
  }

  const authDirective = getDirective(schema, fieldConfig, "auth")?.[0];
  if (!authDirective) {
    return fieldConfig;
  }

  const { resolve = defaultFieldResolver } = fieldConfig;

  fieldConfig.resolve = function (parent, args, context, info) {
    if (!context.user) {
      throw new GraphQLError("Unauthorized");
    }
    return resolve(parent, args, context, info);
  };

  return fieldConfig;
}

  });
}

