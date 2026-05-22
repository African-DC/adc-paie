/**
 * Better Auth client — côté front (React / TanStack Start)
 *
 * Source : labs.convex.dev/better-auth/framework-guides/tanstack-start
 *
 * Plugins client miroir des plugins serveur :
 * - organizationClient : `useActiveOrganization()`, `setActive()`, invitations, members
 * - convexClient : intégration JWT pour Convex
 */
import { createAuthClient } from 'better-auth/react'
import { organizationClient } from 'better-auth/client/plugins'
import { convexClient } from '@convex-dev/better-auth/client/plugins'

const baseURL =
  (typeof window !== 'undefined' ? window.location.origin : undefined) ??
  import.meta.env.VITE_SITE_URL ??
  'http://localhost:3000'

export const authClient = createAuthClient({
  baseURL,
  plugins: [organizationClient(), convexClient()],
})

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  organization,
} = authClient
