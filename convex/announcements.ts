/**
 * Annonces internes — module Convex.
 *
 * Affichées sur le dashboard + page dédiée. Permission "announcements:write"
 * réservée aux owner/admin/dro.
 */

import { v } from 'convex/values'
import { query, mutation } from './_generated/server'
import { withOrg, withOrgRoles } from './lib/withOrg'
import { appendAuditEntry } from './lib/auditLog'

export const list = query({
  args: { onlyPinned: v.optional(v.boolean()) },
  handler: async (ctx, args) =>
    withOrg(ctx, async (octx) => {
      if (args.onlyPinned) {
        return await octx.db
          .query('announcements')
          .withIndex('by_org_pinned', (idx) =>
            idx.eq('organizationId', octx.orgId).eq('pinned', true),
          )
          .order('desc')
          .take(20)
      }
      return await octx.db
        .query('announcements')
        .withIndex('by_org', (idx) => idx.eq('organizationId', octx.orgId))
        .order('desc')
        .take(50)
    }),
})

export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    pinned: v.boolean(),
  },
  handler: async (ctx, args) =>
    withOrgRoles(ctx, ['owner', 'admin', 'dro'], async (octx) => {
      const id = await octx.db.insert('announcements', {
        organizationId: octx.orgId,
        title: args.title,
        content: args.content,
        pinned: args.pinned,
        createdBy: octx.userId,
      })
      const identity = (await octx.auth.getUserIdentity())!
      await appendAuditEntry(octx, {
        organizationId: octx.orgId,
        actorId: octx.userId,
        actorName: (identity.name as string) ?? identity.email ?? octx.userId,
        entry: {
          action: `Annonce publiée : ${args.title}${args.pinned ? ' (épinglée)' : ''}`,
          severity: 'normal',
          metadata: { announcementId: id, pinned: args.pinned },
        },
      })
      return id
    }),
})

export const togglePin = mutation({
  args: { id: v.id('announcements') },
  handler: async (ctx, args) =>
    withOrgRoles(ctx, ['owner', 'admin', 'dro'], async (octx) => {
      const ann = await octx.db.get(args.id)
      if (!ann || ann.organizationId !== octx.orgId) throw new Error('Annonce introuvable')
      await octx.db.patch(args.id, { pinned: !ann.pinned })
      return { ok: true }
    }),
})

export const remove = mutation({
  args: { id: v.id('announcements') },
  handler: async (ctx, args) =>
    withOrgRoles(ctx, ['owner', 'admin', 'dro'], async (octx) => {
      const ann = await octx.db.get(args.id)
      if (!ann || ann.organizationId !== octx.orgId) throw new Error('Annonce introuvable')
      await octx.db.delete(args.id)
      const identity = (await octx.auth.getUserIdentity())!
      await appendAuditEntry(octx, {
        organizationId: octx.orgId,
        actorId: octx.userId,
        actorName: (identity.name as string) ?? identity.email ?? octx.userId,
        entry: {
          action: `Annonce supprimée : ${ann.title}`,
          severity: 'high',
          metadata: { announcementId: args.id, title: ann.title },
        },
      })
      return { ok: true }
    }),
})
