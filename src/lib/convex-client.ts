/**
 * Convex React client — singleton pour l'app TanStack Start
 *
 * En mode démo (VITE_APP_MODE=demo), on pointera vers un deployment Convex
 * séparé. Pour Phase 1, on utilise le deployment principal partout.
 */
import { ConvexReactClient } from 'convex/react'

const convexUrl = import.meta.env.VITE_CONVEX_URL
if (!convexUrl) {
  throw new Error(
    'VITE_CONVEX_URL is not set. Run `npx convex dev` to provision a deployment.',
  )
}

export const convex = new ConvexReactClient(convexUrl)
