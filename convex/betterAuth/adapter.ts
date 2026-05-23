/**
 * Local Install adapter for @convex-dev/better-auth with the organization plugin.
 *
 * This replaces the NPM component's `dist/component/adapter.js` (which only
 * accepts core tables) by registering create/findOne/... mutations whose
 * args.input.model validator accepts our extended schema (including
 * `organization`, `member`, `invitation`).
 *
 * Reference: https://labs.convex.dev/better-auth/features/local-install
 */

import { createApi } from '@convex-dev/better-auth'
import { organization } from 'better-auth/plugins'
import { convex } from '@convex-dev/better-auth/plugins'
import { convexAdapter } from '@convex-dev/better-auth'
import authConfig from '../auth.config'
import schema from './schema'

// Static options used ONLY for schema-table derivation in createApi.
// Must mirror plugins used in runtime `convex/auth.ts::createAuth` so the
// table validators match what Better Auth actually writes.
const staticOptions = {
  database: convexAdapter({} as never, {} as never),
  plugins: [
    organization({
      allowUserToCreateOrganization: true,
      organizationLimit: 5,
      membershipLimit: 100,
      creatorRole: 'owner',
      invitationExpiresIn: 60 * 60 * 24 * 7,
    }),
    convex({ authConfig }),
  ],
}

export const {
  create,
  findOne,
  findMany,
  updateOne,
  updateMany,
  deleteOne,
  deleteMany,
} = createApi(schema, () => staticOptions as never)
