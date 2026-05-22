import { httpRouter } from 'convex/server'
import { httpAction } from './_generated/server'
import { createAuth } from './auth'

const http = httpRouter()

// Mount Better Auth handler on all /api/auth/* routes
http.route({
  pathPrefix: '/api/auth/',
  method: 'GET',
  handler: httpAction(async (ctx, request) => {
    const auth = createAuth(ctx)
    return auth.handler(request)
  }),
})

http.route({
  pathPrefix: '/api/auth/',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    const auth = createAuth(ctx)
    return auth.handler(request)
  }),
})

http.route({
  pathPrefix: '/api/auth/',
  method: 'OPTIONS',
  handler: httpAction(async (_ctx, request) => {
    const headers = request.headers
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': headers.get('Origin') ?? '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400',
      },
    })
  }),
})

export default http
