import express from 'express'
import http from 'http'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@as-integrations/express4'
import { buildSubgraphSchema } from '@apollo/subgraph'

import schemaTypeDefs from './schema/schema.typeDefs.js'
import oauthTypeDefs from './schema/oauth.typeDefs.js'
import resolvers from './resolvers/resolver.js'

import mongoose from 'mongoose'

await mongoose.connect('mongodb://localhost:27017/auth_subgraph')

const app = express()
const httpServer = http.createServer(app)

const server = new ApolloServer({
  schema: buildSubgraphSchema({ typeDefs: [schemaTypeDefs, oauthTypeDefs], resolvers })
})

await server.start()

app.use(
  '/graphql',
  cors({ origin: 'http://localhost:3000', credentials: true }),
  express.json(),
  cookieParser(),
  expressMiddleware(server, { context: ({ req, res }) => ({ req, res }) })
)

httpServer.listen(4010, () => {
  console.log('🔐 Auth subgraph running at http://localhost:4010/graphql')
})
