// src/subgraphs/property/resolvers/property.resolver.js
import { GraphQLError } from "graphql";

let PROPERTIES = [];
const resolvers = {

  Mutation: {
    createProperty: (_, { title, price }, { user }) => {
      if (!user) throw new Error("Unauthorized");
      const property = {
        id: Date.now().toString(),
        title,
        price,
        createdBy: user,
      };
      PROPERTIES.push(property);
      return property;
    },
  },
  Query: {
    properties: () => PROPERTIES,
  },
}

export default resolvers;