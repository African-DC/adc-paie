/**
 * Convex queries/mutations pour organizations + members.
 *
 * Better Auth gère :
 * - Création org (authClient.organization.create) → tables internes du component
 * - Listing orgs (authClient.organization.list)
 * - Invitations (authClient.organization.inviteMember)
 * - Active org / role (authClient.useActiveOrganization)
 *
 * Cette couche Convex ajoute :
 * - `organizationSettings` (paramètres métier ADC Paie spécifiques)
 * - Queries scopées via withOrg() — fail si pas d'org active
 * - Audit log écrit à chaque mutation sensible
 */

import { v } from 'convex/values'
import { query, mutation } from './_generated/server'
import { withOrg, withOrgRoles } from './lib/withOrg'
import { appendAuditEntry } from './lib/auditLog'

export const getCurrentOrgSettings = query({
  args: {},
  handler: async (ctx) =>
    withOrg(ctx, async (octx) => {
      const settings = await octx.db
        .query('organizationSettings')
        .withIndex('by_org', (q) => q.eq('organizationId', octx.orgId))
        .first()
      return settings
    }),
})

export const initOrgSettings = mutation({
  args: {
    ifu: v.string(),
    cnps: v.string(),
    sector: v.string(),
    tauxAT: v.number(),
    city: v.string(),
    convention: v.string(),
  },
  handler: async (ctx, args) =>
    withOrgRoles(ctx, ['owner', 'admin'], async (octx) => {
      // Idempotent : si déjà initialisé, on update au lieu d'insert
      const existing = await octx.db
        .query('organizationSettings')
        .withIndex('by_org', (q) => q.eq('organizationId', octx.orgId))
        .first()
      const settings = {
        organizationId: octx.orgId,
        ifu: args.ifu,
        cnps: args.cnps,
        sector: args.sector,
        tauxAT: args.tauxAT,
        city: args.city,
        convention: args.convention,
        settings: {
          mfa: true,
          loginAlert: true,
          multiSession: false,
          deadlineReminder: true,
          monthlyRecap: true,
          whatsappAlerts: false,
        },
      }
      if (existing) {
        await octx.db.patch(existing._id, settings)
      } else {
        await octx.db.insert('organizationSettings', settings)
      }
      const identity = (await octx.auth.getUserIdentity())!
      await appendAuditEntry(octx, {
        organizationId: octx.orgId,
        actorId: octx.userId,
        actorName: (identity.name as string) ?? identity.email ?? octx.userId,
        entry: {
          action: existing
            ? 'Paramètres entreprise mis à jour'
            : 'Espace entreprise initialisé',
          severity: 'success',
        },
      })
      return { ok: true }
    }),
})

export const updateOrgSettingsField = mutation({
  args: {
    field: v.union(
      v.literal('ifu'),
      v.literal('cnps'),
      v.literal('sector'),
      v.literal('tauxAT'),
      v.literal('city'),
      v.literal('convention'),
    ),
    value: v.union(v.string(), v.number()),
  },
  handler: async (ctx, args) =>
    withOrgRoles(ctx, ['owner', 'admin'], async (octx) => {
      const existing = await octx.db
        .query('organizationSettings')
        .withIndex('by_org', (q) => q.eq('organizationId', octx.orgId))
        .first()
      if (!existing) {
        throw new Error('Espace non initialisé — appelez initOrgSettings d\'abord')
      }
      await octx.db.patch(existing._id, { [args.field]: args.value as any })
      const identity = (await octx.auth.getUserIdentity())!
      await appendAuditEntry(octx, {
        organizationId: octx.orgId,
        actorId: octx.userId,
        actorName: (identity.name as string) ?? identity.email ?? octx.userId,
        entry: {
          action: `Mise à jour ${args.field} → ${args.value}`,
          severity: 'high',
          metadata: { field: args.field, value: args.value },
        },
      })
      return { ok: true }
    }),
})

export const updateOrgTogglePreference = mutation({
  args: {
    key: v.union(
      v.literal('mfa'),
      v.literal('loginAlert'),
      v.literal('multiSession'),
      v.literal('deadlineReminder'),
      v.literal('monthlyRecap'),
      v.literal('whatsappAlerts'),
    ),
    value: v.boolean(),
  },
  handler: async (ctx, args) =>
    withOrgRoles(ctx, ['owner', 'admin'], async (octx) => {
      const existing = await octx.db
        .query('organizationSettings')
        .withIndex('by_org', (q) => q.eq('organizationId', octx.orgId))
        .first()
      if (!existing) {
        throw new Error('Espace non initialisé')
      }
      await octx.db.patch(existing._id, {
        settings: { ...existing.settings, [args.key]: args.value },
      })
      return { ok: true }
    }),
})

/**
 * Liste les entrées du journal d'audit pour l'org active.
 * Limité aux 100 dernières entrées par défaut (à paginer Phase 5).
 */
export const listAuditLog = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) =>
    withOrgRoles(ctx, ['owner', 'admin', 'comptable'], async (octx) => {
      const entries = await octx.db
        .query('auditLog')
        .withIndex('by_org_seq', (q) => q.eq('organizationId', octx.orgId))
        .order('desc')
        .take(args.limit ?? 100)
      return entries
    }),
})
