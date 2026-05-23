/**
 * Avances sur salaire — module Convex.
 *
 * Workflow : employee request → DRH/admin approve → comptable pay.
 * Permissions :
 * - advances:read → all roles (salarie self only)
 * - advances:approve → owner, admin, dro
 * - advances:pay → owner, admin, comptable
 */

import { v } from 'convex/values'
import { query, mutation } from './_generated/server'
import { withOrg, withOrgRoles } from './lib/withOrg'
import { appendAuditEntry } from './lib/auditLog'

export const list = query({
  args: {
    status: v.optional(
      v.union(
        v.literal('pending'),
        v.literal('approved'),
        v.literal('paid'),
        v.literal('rejected'),
      ),
    ),
  },
  handler: async (ctx, args) =>
    withOrg(ctx, async (octx) => {
      let q = args.status
        ? octx.db.query('advances').withIndex('by_org_status', (idx) =>
            idx.eq('organizationId', octx.orgId).eq('status', args.status!),
          )
        : octx.db.query('advances').withIndex('by_org', (idx) => idx.eq('organizationId', octx.orgId))
      const advances = await q.order('desc').take(200)
      // Salarié voit que les siennes
      if (octx.userRole === 'salarie') {
        const me = await octx.db
          .query('employees')
          .withIndex('by_user', (idx) => idx.eq('userId', octx.userId))
          .first()
        if (!me) return []
        return advances.filter((a) => a.employeeId === me._id)
      }
      return advances
    }),
})

export const request = mutation({
  args: {
    employeeId: v.id('employees'),
    amount: v.number(),
    reason: v.string(),
    repaymentMonths: v.optional(v.number()),
  },
  handler: async (ctx, args) =>
    withOrg(ctx, async (octx) => {
      const emp = await octx.db.get(args.employeeId)
      if (!emp || emp.organizationId !== octx.orgId) {
        throw new Error('Salarié introuvable')
      }
      // Salarié peut seulement demander pour lui-même
      if (octx.userRole === 'salarie' && emp.userId !== octx.userId) {
        throw new Error('Vous ne pouvez demander une avance que pour vous-même')
      }
      // Plafond métier : 30% du brut (politique standard CI)
      if (args.amount > emp.brut * 0.3) {
        throw new Error(`Avance limitée à 30 % du brut mensuel (${Math.round(emp.brut * 0.3).toLocaleString('fr-FR')} FCFA max)`)
      }
      const id = await octx.db.insert('advances', {
        organizationId: octx.orgId,
        employeeId: args.employeeId,
        amount: args.amount,
        requestedAt: Date.now(),
        reason: args.reason,
        status: 'pending',
        repaymentMonths: args.repaymentMonths,
      })
      const identity = (await octx.auth.getUserIdentity())!
      await appendAuditEntry(octx, {
        organizationId: octx.orgId,
        actorId: octx.userId,
        actorName: (identity.name as string) ?? identity.email ?? octx.userId,
        entry: {
          action: `Demande d'avance : ${emp.firstName} ${emp.lastName} · ${args.amount.toLocaleString('fr-FR')} FCFA`,
          severity: 'normal',
          metadata: { advanceId: id, amount: args.amount },
        },
      })
      return id
    }),
})

export const approve = mutation({
  args: { id: v.id('advances') },
  handler: async (ctx, args) =>
    withOrgRoles(ctx, ['owner', 'admin', 'dro'], async (octx) => {
      const adv = await octx.db.get(args.id)
      if (!adv || adv.organizationId !== octx.orgId) throw new Error('Avance introuvable')
      await octx.db.patch(args.id, {
        status: 'approved',
        approvedBy: octx.userId,
        approvedAt: Date.now(),
      })
      const emp = await octx.db.get(adv.employeeId)
      const identity = (await octx.auth.getUserIdentity())!
      await appendAuditEntry(octx, {
        organizationId: octx.orgId,
        actorId: octx.userId,
        actorName: (identity.name as string) ?? identity.email ?? octx.userId,
        entry: {
          action: `Avance approuvée : ${emp?.firstName} ${emp?.lastName} · ${adv.amount.toLocaleString('fr-FR')} FCFA`,
          severity: 'success',
          metadata: { advanceId: args.id },
        },
      })
      return { ok: true }
    }),
})

export const reject = mutation({
  args: { id: v.id('advances'), reason: v.optional(v.string()) },
  handler: async (ctx, args) =>
    withOrgRoles(ctx, ['owner', 'admin', 'dro'], async (octx) => {
      const adv = await octx.db.get(args.id)
      if (!adv || adv.organizationId !== octx.orgId) throw new Error('Avance introuvable')
      await octx.db.patch(args.id, { status: 'rejected' })
      const emp = await octx.db.get(adv.employeeId)
      const identity = (await octx.auth.getUserIdentity())!
      await appendAuditEntry(octx, {
        organizationId: octx.orgId,
        actorId: octx.userId,
        actorName: (identity.name as string) ?? identity.email ?? octx.userId,
        entry: {
          action: `Avance refusée : ${emp?.firstName} ${emp?.lastName}${args.reason ? ` — ${args.reason}` : ''}`,
          severity: 'normal',
          metadata: { advanceId: args.id, reason: args.reason },
        },
      })
      return { ok: true }
    }),
})

export const markPaid = mutation({
  args: { id: v.id('advances') },
  handler: async (ctx, args) =>
    withOrgRoles(ctx, ['owner', 'admin', 'comptable'], async (octx) => {
      const adv = await octx.db.get(args.id)
      if (!adv || adv.organizationId !== octx.orgId) throw new Error('Avance introuvable')
      if (adv.status !== 'approved') throw new Error('Avance non approuvée')
      await octx.db.patch(args.id, { status: 'paid', paidAt: Date.now() })
      const emp = await octx.db.get(adv.employeeId)
      const identity = (await octx.auth.getUserIdentity())!
      await appendAuditEntry(octx, {
        organizationId: octx.orgId,
        actorId: octx.userId,
        actorName: (identity.name as string) ?? identity.email ?? octx.userId,
        entry: {
          action: `Avance payée : ${emp?.firstName} ${emp?.lastName} · ${adv.amount.toLocaleString('fr-FR')} FCFA`,
          severity: 'high',
          metadata: { advanceId: args.id, amount: adv.amount },
        },
      })
      return { ok: true }
    }),
})
