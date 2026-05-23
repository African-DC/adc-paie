/**
 * Reports — agrégats RH/paie pour le dashboard et la page Reports.
 *
 * Toutes en queries (lecture seule). Pas de mutations.
 */

import { v } from 'convex/values'
import { query } from './_generated/server'
import { withOrgRoles } from './lib/withOrg'

export const dashboardKPIs = query({
  args: {},
  handler: async (ctx) =>
    withOrgRoles(ctx, ['owner', 'admin', 'dro', 'comptable'], async (octx) => {
      const employees = await octx.db
        .query('employees')
        .withIndex('by_org', (idx) => idx.eq('organizationId', octx.orgId))
        .collect()

      const active = employees.filter((e) => e.status === 'active')
      const onLeave = employees.filter((e) => e.status === 'leave')
      const masseBrut = active.reduce((s, e) => s + e.brut, 0)

      // Pending leaves
      const pendingLeaves = await octx.db
        .query('leaves')
        .withIndex('by_org_status', (idx) =>
          idx.eq('organizationId', octx.orgId).eq('status', 'pending'),
        )
        .collect()

      // Pending advances
      const pendingAdvances = await octx.db
        .query('advances')
        .withIndex('by_org_status', (idx) =>
          idx.eq('organizationId', octx.orgId).eq('status', 'pending'),
        )
        .collect()

      // Charges patronales estimées (forfait ~17%)
      const chargesPatronales = Math.round(masseBrut * 0.17)

      return {
        effectif: {
          total: employees.length,
          active: active.length,
          onLeave: onLeave.length,
        },
        masseBrut,
        chargesPatronales,
        pendingLeaves: pendingLeaves.length,
        pendingAdvances: pendingAdvances.length,
      }
    }),
})

export const massSalarialeMonthly = query({
  args: { fromYear: v.number(), toYear: v.number() },
  handler: async (ctx, args) =>
    withOrgRoles(ctx, ['owner', 'admin', 'comptable'], async (octx) => {
      // Récupère tous les payslips dans la fenêtre
      const allSlips = await octx.db
        .query('payslips')
        .withIndex('by_org_period', (idx) => idx.eq('organizationId', octx.orgId))
        .collect()
      const filtered = allSlips.filter(
        (s) => s.period.year >= args.fromYear && s.period.year <= args.toYear,
      )
      // Group par period
      const groups = new Map<string, { period: { year: number; month: number }; totalBrut: number; totalNet: number; count: number }>()
      for (const s of filtered) {
        const key = `${s.period.year}-${String(s.period.month).padStart(2, '0')}`
        const existing = groups.get(key) ?? {
          period: s.period,
          totalBrut: 0,
          totalNet: 0,
          count: 0,
        }
        existing.totalBrut += s.brutTotal
        existing.totalNet += s.netAPayer
        existing.count += 1
        groups.set(key, existing)
      }
      return Array.from(groups.values()).sort(
        (a, b) =>
          a.period.year - b.period.year || a.period.month - b.period.month,
      )
    }),
})

export const turnoverByMonth = query({
  args: { year: v.number() },
  handler: async (ctx, args) =>
    withOrgRoles(ctx, ['owner', 'admin', 'dro'], async (octx) => {
      const employees = await octx.db
        .query('employees')
        .withIndex('by_org', (idx) => idx.eq('organizationId', octx.orgId))
        .collect()
      const result: { month: number; hired: number; terminated: number }[] = []
      for (let m = 1; m <= 12; m++) {
        const yyyyMm = `${args.year}-${String(m).padStart(2, '0')}`
        result.push({
          month: m,
          hired: employees.filter((e) => e.joinedAt.startsWith(yyyyMm)).length,
          terminated: employees.filter((e) => e.status === 'terminated' && e.joinedAt.startsWith(yyyyMm)).length,
        })
      }
      return result
    }),
})
