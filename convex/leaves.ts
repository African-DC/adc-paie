/**
 * Congés & absences — module Convex.
 *
 * Workflow : employee request → DRH/admin approve → impacts paie automatique (Phase 8+).
 * Types : congé annuel (2,5j/mois CCI Art. 25), maladie, maternité (14 sem CI), paternité, exceptionnel.
 */

import { v } from 'convex/values'
import { query, mutation } from './_generated/server'
import { withOrg, withOrgRoles } from './lib/withOrg'
import { appendAuditEntry } from './lib/auditLog'

const leaveType = v.union(
  v.literal('congé'),
  v.literal('maladie'),
  v.literal('maternité'),
  v.literal('paternité'),
  v.literal('exceptionnel'),
)

export const list = query({
  args: {
    status: v.optional(
      v.union(
        v.literal('pending'),
        v.literal('approved'),
        v.literal('rejected'),
        v.literal('cancelled'),
      ),
    ),
  },
  handler: async (ctx, args) =>
    withOrg(ctx, async (octx) => {
      let q = args.status
        ? octx.db.query('leaves').withIndex('by_org_status', (idx) =>
            idx.eq('organizationId', octx.orgId).eq('status', args.status!),
          )
        : octx.db.query('leaves').withIndex('by_org', (idx) => idx.eq('organizationId', octx.orgId))
      const leaves = await q.order('desc').take(200)
      if (octx.userRole === 'salarie') {
        const me = await octx.db
          .query('employees')
          .withIndex('by_user', (idx) => idx.eq('userId', octx.userId))
          .first()
        if (!me) return []
        return leaves.filter((l) => l.employeeId === me._id)
      }
      return leaves
    }),
})

export const listForEmployee = query({
  args: { employeeId: v.id('employees') },
  handler: async (ctx, args) =>
    withOrg(ctx, async (octx) => {
      const leaves = await octx.db
        .query('leaves')
        .withIndex('by_employee', (idx) => idx.eq('employeeId', args.employeeId))
        .order('desc')
        .take(50)
      return leaves.filter((l) => l.organizationId === octx.orgId)
    }),
})

function computeDays(startDate: string, endDate: string): number {
  const s = new Date(startDate)
  const e = new Date(endDate)
  const diff = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1
  return Math.max(1, diff)
}

export const request = mutation({
  args: {
    employeeId: v.id('employees'),
    type: leaveType,
    startDate: v.string(),
    endDate: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) =>
    withOrg(ctx, async (octx) => {
      const emp = await octx.db.get(args.employeeId)
      if (!emp || emp.organizationId !== octx.orgId) throw new Error('Salarié introuvable')
      if (octx.userRole === 'salarie' && emp.userId !== octx.userId) {
        throw new Error('Vous ne pouvez demander un congé que pour vous-même')
      }
      const days = computeDays(args.startDate, args.endDate)
      const id = await octx.db.insert('leaves', {
        organizationId: octx.orgId,
        employeeId: args.employeeId,
        type: args.type,
        startDate: args.startDate,
        endDate: args.endDate,
        days,
        status: 'pending',
        requestedAt: Date.now(),
        reason: args.reason,
      })
      const identity = (await octx.auth.getUserIdentity())!
      await appendAuditEntry(octx, {
        organizationId: octx.orgId,
        actorId: octx.userId,
        actorName: (identity.name as string) ?? identity.email ?? octx.userId,
        entry: {
          action: `Demande ${args.type} : ${emp.firstName} ${emp.lastName} · ${days} jour(s) du ${args.startDate} au ${args.endDate}`,
          severity: 'normal',
          metadata: { leaveId: id, days, type: args.type },
        },
      })
      return id
    }),
})

export const approve = mutation({
  args: { id: v.id('leaves') },
  handler: async (ctx, args) =>
    withOrgRoles(ctx, ['owner', 'admin', 'dro'], async (octx) => {
      const lv = await octx.db.get(args.id)
      if (!lv || lv.organizationId !== octx.orgId) throw new Error('Congé introuvable')
      await octx.db.patch(args.id, {
        status: 'approved',
        approvedBy: octx.userId,
        approvedAt: Date.now(),
      })
      const emp = await octx.db.get(lv.employeeId)
      const identity = (await octx.auth.getUserIdentity())!
      await appendAuditEntry(octx, {
        organizationId: octx.orgId,
        actorId: octx.userId,
        actorName: (identity.name as string) ?? identity.email ?? octx.userId,
        entry: {
          action: `${lv.type} approuvé : ${emp?.firstName} ${emp?.lastName} · ${lv.days} jour(s)`,
          severity: 'success',
          metadata: { leaveId: args.id, days: lv.days },
        },
      })
      return { ok: true }
    }),
})

export const reject = mutation({
  args: { id: v.id('leaves'), reason: v.optional(v.string()) },
  handler: async (ctx, args) =>
    withOrgRoles(ctx, ['owner', 'admin', 'dro'], async (octx) => {
      const lv = await octx.db.get(args.id)
      if (!lv || lv.organizationId !== octx.orgId) throw new Error('Congé introuvable')
      await octx.db.patch(args.id, { status: 'rejected' })
      const emp = await octx.db.get(lv.employeeId)
      const identity = (await octx.auth.getUserIdentity())!
      await appendAuditEntry(octx, {
        organizationId: octx.orgId,
        actorId: octx.userId,
        actorName: (identity.name as string) ?? identity.email ?? octx.userId,
        entry: {
          action: `${lv.type} refusé : ${emp?.firstName} ${emp?.lastName}${args.reason ? ` — ${args.reason}` : ''}`,
          severity: 'normal',
          metadata: { leaveId: args.id, reason: args.reason },
        },
      })
      return { ok: true }
    }),
})

export const cancel = mutation({
  args: { id: v.id('leaves') },
  handler: async (ctx, args) =>
    withOrg(ctx, async (octx) => {
      const lv = await octx.db.get(args.id)
      if (!lv || lv.organizationId !== octx.orgId) throw new Error('Congé introuvable')
      // Salarié peut annuler son propre congé tant qu'il est pending
      if (octx.userRole === 'salarie') {
        const me = await octx.db
          .query('employees')
          .withIndex('by_user', (idx) => idx.eq('userId', octx.userId))
          .first()
        if (!me || lv.employeeId !== me._id) throw new Error('Non autorisé')
        if (lv.status !== 'pending') throw new Error('Congé déjà traité, contactez votre RH')
      }
      await octx.db.patch(args.id, { status: 'cancelled' })
      return { ok: true }
    }),
})
