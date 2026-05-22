/**
 * Proxy server pour Better Auth + Convex en TanStack Start.
 *
 * Le client Better Auth tape /api/auth/* sur l'origine du frontend.
 * Ce handler forward la requête vers le Convex Site URL où Better Auth
 * est réellement monté (via convex/http.ts).
 *
 * Documentation : @convex-dev/better-auth/react-start
 */
import { convexBetterAuthReactStart } from '@convex-dev/better-auth/react-start'

const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {}

const convexUrl = env.VITE_CONVEX_URL ?? env.CONVEX_URL
const convexSiteUrl = env.VITE_CONVEX_SITE_URL ?? env.CONVEX_SITE_URL

if (!convexUrl || !convexSiteUrl) {
  throw new Error(
    'VITE_CONVEX_URL / VITE_CONVEX_SITE_URL must be set. Run `npx convex dev` first.',
  )
}

export const authServer = convexBetterAuthReactStart({
  convexUrl,
  convexSiteUrl,
})
