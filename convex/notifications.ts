/**
 * Notifications utilisateur — module Convex.
 *
 * Realtime via useQuery subscriptions.
 */

import { v } from 'convex/values'
import { query, mutation } from './_generated/server'
import { withOrg } from './lib/withOrg'

export const listMine = query({
  args: { unreadOnly: v.optional(v.boolean()) },
  handler: async (ctx, args) =>
    withOrg(ctx, async (octx) => {
      if (args.unreadOnly) {
        return await octx.db
          .query('notifications')
          .withIndex('by_user_read', (idx) =>
            idx.eq('userId', octx.userId).eq('read', false),
          )
          .order('desc')
          .take(50)
      }
      const all = await octx.db
        .query('notifications')
        .withIndex('by_org', (idx) => idx.eq('organizationId', octx.orgId))
        .order('desc')
        .take(50)
      return all.filter((n) => n.userId === octx.userId)
    }),
})

export const countUnread = query({
  args: {},
  handler: async (ctx) =>
    withOrg(ctx, async (octx) => {
      const unread = await octx.db
        .query('notifications')
        .withIndex('by_user_read', (idx) =>
          idx.eq('userId', octx.userId).eq('read', false),
        )
        .collect()
      return unread.length
    }),
})

export const markRead = mutation({
  args: { id: v.id('notifications') },
  handler: async (ctx, args) =>
    withOrg(ctx, async (octx) => {
      const n = await octx.db.get(args.id)
      if (!n || n.userId !== octx.userId) throw new Error('Notification introuvable')
      if (!n.read) {
        await octx.db.patch(args.id, { read: true })
      }
      return { ok: true }
    }),
})

export const markAllRead = mutation({
  args: {},
  handler: async (ctx) =>
    withOrg(ctx, async (octx) => {
      const unread = await octx.db
        .query('notifications')
        .withIndex('by_user_read', (idx) =>
          idx.eq('userId', octx.userId).eq('read', false),
        )
        .collect()
      for (const n of unread) {
        await octx.db.patch(n._id, { read: true })
      }
      return { ok: true, count: unread.length }
    }),
})

/**
 * Internal helper appelable depuis d'autres mutations Convex pour créer
 * une notification pour un user spécifique.
 */
export const create = mutation({
  args: {
    userId: v.string(),
    title: v.string(),
    description: v.string(),
    type: v.union(v.literal('info'), v.literal('warning'), v.literal('success')),
  },
  handler: async (ctx, args) =>
    withOrg(ctx, async (octx) => {
      return await octx.db.insert('notifications', {
        organizationId: octx.orgId,
        userId: args.userId,
        title: args.title,
        description: args.description,
        read: false,
        type: args.type,
      })
    }),
})
