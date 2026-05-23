/**
 * Pointage / présences — module Convex.
 *
 * Usage simple : pointer un salarié présent/absent pour une date donnée
 * (utilisable pour générer le prorata payroll Phase 4+).
 */

import { v } from 'convex/values'
import { query, mutation } from './_generated/server'
import { withOrg, withOrgRoles } from './lib/withOrg'
import { appendAuditEntry } from './lib/auditLog'

export const listForDate = query({
  args: { date: v.string() },
  handler: async (ctx, args) =>
    withOrg(ctx, async (octx) => {
      const records = await octx.db
        .query('attendance')
        .withIndex('by_org_date', (idx) =>
          idx.eq('organizationId', octx.orgId).eq('date', args.date),
        )
        .collect()
      return records
    }),
})

export const listForEmployee = query({
  args: { employeeId: v.id('employees'), fromDate: v.optional(v.string()), toDate: v.optional(v.string()) },
  handler: async (ctx, args) =>
    withOrg(ctx, async (octx) => {
      const records = await octx.db
        .query('attendance')
        .withIndex('by_employee_date', (idx) => idx.eq('employeeId', args.employeeId))
        .collect()
      return records.filter((r) => {
        if (r.organizationId !== octx.orgId) return false
        if (args.fromDate && r.date < args.fromDate) return false
        if (args.toDate && r.date > args.toDate) return false
        return true
      })
    }),
})

export const record = mutation({
  args: {
    employeeId: v.id('employees'),
    date: v.string(),
    present: v.boolean(),
    hoursWorked: v.optional(v.number()),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) =>
    withOrgRoles(ctx, ['owner', 'admin', 'dro'], async (octx) => {
      const emp = await octx.db.get(args.employeeId)
      if (!emp || emp.organizationId !== octx.orgId) throw new Error('Salarié introuvable')
      // Idempotent : update si existe déjà
      const existing = await octx.db
        .query('attendance')
        .withIndex('by_employee_date', (idx) =>
          idx.eq('employeeId', args.employeeId).eq('date', args.date),
        )
        .first()
      const data = {
        organizationId: octx.orgId,
        employeeId: args.employeeId,
        date: args.date,
        present: args.present,
        hoursWorked: args.hoursWorked,
        reason: args.reason,
        recordedBy: octx.userId,
      }
      if (existing) {
        await octx.db.patch(existing._id, data)
        return existing._id
      }
      return await octx.db.insert('attendance', data)
    }),
})

export const recordBulk = mutation({
  args: {
    date: v.string(),
    records: v.array(
      v.object({
        employeeId: v.id('employees'),
        present: v.boolean(),
        hoursWorked: v.optional(v.number()),
      }),
    ),
  },
  handler: async (ctx, args) =>
    withOrgRoles(ctx, ['owner', 'admin', 'dro'], async (octx) => {
      let count = 0
      for (const r of args.records) {
        const emp = await octx.db.get(r.employeeId)
        if (!emp || emp.organizationId !== octx.orgId) continue
        const existing = await octx.db
          .query('attendance')
          .withIndex('by_employee_date', (idx) =>
            idx.eq('employeeId', r.employeeId).eq('date', args.date),
          )
          .first()
        const data = {
          organizationId: octx.orgId,
          employeeId: r.employeeId,
          date: args.date,
          present: r.present,
          hoursWorked: r.hoursWorked,
          recordedBy: octx.userId,
        }
        if (existing) await octx.db.patch(existing._id, data)
        else await octx.db.insert('attendance', data)
        count++
      }
      const identity = (await octx.auth.getUserIdentity())!
      await appendAuditEntry(octx, {
        organizationId: octx.orgId,
        actorId: octx.userId,
        actorName: (identity.name as string) ?? identity.email ?? octx.userId,
        entry: {
          action: `Pointage du ${args.date} : ${count} salariés enregistrés`,
          severity: 'normal',
          metadata: { date: args.date, count },
        },
      })
      return { ok: true, count }
    }),
})
