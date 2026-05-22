/**
 * Catch-all API route pour forwarder /api/auth/* vers Better Auth sur Convex.
 *
 * Better Auth client envoie ses requêtes sur l'origine du frontend
 * (window.location.origin/api/auth/sign-up/email, etc.). Cette route
 * intercepte et proxify vers le Convex Site URL où le handler vit
 * réellement (convex/http.ts).
 */
import { createFileRoute } from '@tanstack/react-router'
import { authServer } from '../../lib/auth-server'

export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: ({ request }) => authServer.handler(request),
      POST: ({ request }) => authServer.handler(request),
      OPTIONS: ({ request }) => authServer.handler(request),
    },
  },
})
