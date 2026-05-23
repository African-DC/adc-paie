/**
 * Better Auth setup pour ADC Paie — Phase 1
 *
 * Source : labs.convex.dev/better-auth/framework-guides/tanstack-start
 * Stack : @convex-dev/better-auth v0.12.2 + better-auth v1.6.11
 *
 * Plugins activés :
 * - emailAndPassword (login basique pour Phase 1)
 * - organization (multi-tenant : PME = organization, RH/comptable/salarié = members)
 *
 * Plugins à ajouter ultérieurement :
 * - magicLink (Phase 5+ pour invitations members par email)
 * - twoFactor (Phase 8 pour MFA admin)
 */

import { betterAuth } from 'better-auth'
import { organization } from 'better-auth/plugins'
import { convex } from '@convex-dev/better-auth/plugins'
import { convexAdapter } from '@convex-dev/better-auth'
import { components } from './_generated/api'
import authConfig from './auth.config'
import { type GenericCtx } from '@convex-dev/better-auth'
import type { DataModel } from './_generated/dataModel'

const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {}
const siteUrl = env.SITE_URL ?? env.CONVEX_SITE_URL ?? 'http://localhost:3000'

export const createAuth = (ctx: GenericCtx<DataModel>) =>
  betterAuth({
    baseURL: siteUrl,
    database: convexAdapter(ctx as never, components.betterAuth as never),
    trustedOrigins: [
      'http://localhost:3000',
      'http://localhost:3001',
      siteUrl,
    ],
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false, // Phase 8 : true + envoi email
      autoSignIn: true,
      minPasswordLength: 8,
      maxPasswordLength: 128,
    },
    user: {
      additionalFields: {
        // Stocke l'org active pour propager au JWT (consumable par withOrg)
        activeOrganizationId: {
          type: 'string',
          required: false,
          input: false,
        },
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 jours
      updateAge: 60 * 60 * 24, // refresh chaque 24h d'activité
    },
    plugins: [
      organization({
        allowUserToCreateOrganization: true,
        organizationLimit: 5, // max 5 orgs par user
        membershipLimit: 100, // max 100 members par org
        creatorRole: 'owner',
        invitationExpiresIn: 60 * 60 * 24 * 7, // 7 jours
      }),
      convex({
        authConfig,
        // CRITIQUE : custom JWT claims pour multi-tenant scoping.
        // Le helper withOrg() Convex lit identity.activeOrganizationId.
        // Sans ce definePayload, toutes les mutations multi-tenant échouent
        // avec "No active organization".
        jwt: {
          definePayload: ({ user, session }) => ({
            email: user.email,
            name: user.name,
            emailVerified: user.emailVerified,
            activeOrganizationId:
              (session as { activeOrganizationId?: string }).activeOrganizationId ?? null,
          }),
        },
      }),
    ],
    logger: {
      level: 'warn',
    },
  })
