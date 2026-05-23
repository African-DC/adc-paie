/**
 * Module Payroll Convex — appelle @adc/payroll-engine côté serveur pour
 * garantir la conformité légale (calcul reproductible, audit trail).
 *
 * Le calcul ne tourne PAS côté client en preview rapide pour les listings
 * (perf + audit). Les pages UI utilisent les payslips persistés.
 *
 * Permissions :
 * - payroll:read → owner, admin, dro, comptable (tous voient), salarie (self only)
 * - payroll:write/generate → owner, admin, comptable
 * - payroll:pay → owner, admin, comptable
 */

import { v } from 'convex/values'
import { query, mutation } from './_generated/server'
import { withOrg, withOrgRoles } from './lib/withOrg'
import { appendAuditEntry } from './lib/auditLog'
import {
  computePayslip,
  ENGINE_VERSION,
  type PayslipInput,
} from '@adc/payroll-engine'
import { BAREME_YEAR } from '@adc/payroll-engine'

const periodArg = v.object({
  year: v.number(),
  month: v.number(),
})

export const listForPeriod = query({
  args: { period: periodArg },
  handler: async (ctx, args) =>
    withOrg(ctx, async (octx) => {
      const slips = await octx.db
        .query('payslips')
        .withIndex('by_org_period', (idx) =>
          idx
            .eq('organizationId', octx.orgId)
            .eq('period.year', args.period.year)
            .eq('period.month', args.period.month),
        )
        .collect()
      // Salarié voit uniquement son propre bulletin
      if (octx.userRole === 'salarie') {
        const me = await octx.db
          .query('employees')
          .withIndex('by_user', (idx) => idx.eq('userId', octx.userId))
          .first()
        if (!me) return []
        return slips.filter((s) => s.employeeId === me._id)
      }
      return slips
    }),
})

export const getOne = query({
  args: { id: v.id('payslips') },
  handler: async (ctx, args) =>
    withOrg(ctx, async (octx) => {
      const slip = await octx.db.get(args.id)
      if (!slip || slip.organizationId !== octx.orgId) return null
      // Salarié peut voir uniquement ses bulletins
      if (octx.userRole === 'salarie') {
        const me = await octx.db
          .query('employees')
          .withIndex('by_user', (idx) => idx.eq('userId', octx.userId))
          .first()
        if (!me || slip.employeeId !== me._id) return null
      }
      return slip
    }),
})

export const getOneByEmployeeAndPeriod = query({
  args: {
    employeeId: v.id('employees'),
    period: periodArg,
  },
  handler: async (ctx, args) =>
    withOrg(ctx, async (octx) => {
      const slip = await octx.db
        .query('payslips')
        .withIndex('by_employee_period', (idx) =>
          idx
            .eq('employeeId', args.employeeId)
            .eq('period.year', args.period.year)
            .eq('period.month', args.period.month),
        )
        .first()
      if (!slip || slip.organizationId !== octx.orgId) return null
      return slip
    }),
})

export const totalsForPeriod = query({
  args: { period: periodArg },
  handler: async (ctx, args) =>
    withOrg(ctx, async (octx) => {
      const slips = await octx.db
        .query('payslips')
        .withIndex('by_org_period', (idx) =>
          idx
            .eq('organizationId', octx.orgId)
            .eq('period.year', args.period.year)
            .eq('period.month', args.period.month),
        )
        .collect()
      return {
        count: slips.length,
        totalBrut: slips.reduce((s, p) => s + p.brutTotal, 0),
        totalNet: slips.reduce((s, p) => s + p.netAPayer, 0),
        totalCotisationsSalarie: slips.reduce((s, p) => s + p.cotisationsSalarieTotal, 0),
        totalCotisationsEmployeur: slips.reduce((s, p) => s + p.cotisationsEmployeurTotal, 0),
        totalImpots: slips.reduce((s, p) => s + p.totalImpots, 0),
        totalCoutEmployeur: slips.reduce((s, p) => s + p.totalCoutEmployeur, 0),
      }
    }),
})

/**
 * Génère (ou regénère) les bulletins pour une période donnée.
 * Idempotent : si un bulletin existe déjà, il est mis à jour (status reset à draft).
 *
 * Calcul fait côté serveur via @adc/payroll-engine (assure conformité légale).
 */
export const generate = mutation({
  args: {
    period: periodArg,
    employeeIds: v.optional(v.array(v.id('employees'))),
  },
  handler: async (ctx, args) =>
    withOrgRoles(ctx, ['owner', 'admin', 'comptable'], async (octx) => {
      // Récupérer les salariés à inclure
      let employees
      if (args.employeeIds && args.employeeIds.length > 0) {
        employees = await Promise.all(args.employeeIds.map((id) => octx.db.get(id)))
        employees = employees.filter(
          (e): e is NonNullable<typeof e> => e !== null && e.organizationId === octx.orgId,
        )
      } else {
        employees = await octx.db
          .query('employees')
          .withIndex('by_org_status', (idx) =>
            idx.eq('organizationId', octx.orgId).eq('status', 'active'),
          )
          .collect()
      }

      // Récupérer le taux AT de l'org pour défaut
      const orgSettings = await octx.db
        .query('organizationSettings')
        .withIndex('by_org', (idx) => idx.eq('organizationId', octx.orgId))
        .first()
      const orgTauxAT = orgSettings?.tauxAT ?? 0.025

      const results: { employeeId: string; payslipId: string; netAPayer: number }[] = []

      for (const emp of employees) {
        const input: PayslipInput = {
          brut: emp.brut,
          family: {
            situation: emp.family.situation,
            kids: emp.family.kids,
          },
          joinedAt: emp.joinedAt,
          period: args.period,
          joursTravailles: 26,
          joursOuvres: 26,
          heuresSupp: { jour: 0, nuit: 0, dimanche: 0, ferie: 0 },
          indemnites: { transport: 0, logement: 0, repas: 0, fonction: 0, autres: 0 },
          retenues: { avances: 0, cessions: 0, saisies: 0, autres: 0 },
          primes: 0,
          tauxAT: emp.tauxAT ?? orgTauxAT,
          heuresHebdo: 40,
        }
        const result = computePayslip(input)
        const b = result.breakdown

        // Idempotent : check existing
        const existing = await octx.db
          .query('payslips')
          .withIndex('by_employee_period', (idx) =>
            idx
              .eq('employeeId', emp._id)
              .eq('period.year', args.period.year)
              .eq('period.month', args.period.month),
          )
          .first()

        const payslipData = {
          organizationId: octx.orgId,
          employeeId: emp._id,
          period: args.period,
          brutMensuel: emp.brut,
          brutTotal: b.brutTotal,
          netAPayer: b.net.netAPayer,
          cotisationsSalarieTotal: b.cotisationsSalarie.total,
          cotisationsEmployeurTotal: b.cotisationsEmployeur.total,
          totalImpots: b.impots.totalImpots,
          totalCoutEmployeur: b.totalCoutEmployeur,
          breakdown: b,
          status: 'draft' as const,
          engineVersion: ENGINE_VERSION,
          baremeYear: BAREME_YEAR,
          computedBy: octx.userId,
        }

        let payslipId: string
        if (existing) {
          await octx.db.patch(existing._id, payslipData)
          payslipId = existing._id
        } else {
          payslipId = await octx.db.insert('payslips', payslipData)
        }
        results.push({
          employeeId: emp._id,
          payslipId,
          netAPayer: b.net.netAPayer,
        })
      }

      const identity = (await octx.auth.getUserIdentity())!
      const periodLabel = `${String(args.period.month).padStart(2, '0')}/${args.period.year}`
      await appendAuditEntry(octx, {
        organizationId: octx.orgId,
        actorId: octx.userId,
        actorName: (identity.name as string) ?? identity.email ?? octx.userId,
        entry: {
          action: `Génération paie ${periodLabel} : ${results.length} bulletins calculés`,
          severity: 'success',
          metadata: {
            period: args.period,
            count: results.length,
            engineVersion: ENGINE_VERSION,
            totalNet: results.reduce((s, r) => s + r.netAPayer, 0),
          },
        },
      })

      return { count: results.length, results }
    }),
})

/**
 * Valide un bulletin (passage draft → validated).
 */
export const validate = mutation({
  args: { id: v.id('payslips') },
  handler: async (ctx, args) =>
    withOrgRoles(ctx, ['owner', 'admin', 'comptable'], async (octx) => {
      const slip = await octx.db.get(args.id)
      if (!slip || slip.organizationId !== octx.orgId) {
        throw new Error('Bulletin introuvable')
      }
      await octx.db.patch(args.id, { status: 'validated' })
      const emp = await octx.db.get(slip.employeeId)
      const identity = (await octx.auth.getUserIdentity())!
      await appendAuditEntry(octx, {
        organizationId: octx.orgId,
        actorId: octx.userId,
        actorName: (identity.name as string) ?? identity.email ?? octx.userId,
        entry: {
          action: `Bulletin validé : ${emp?.firstName} ${emp?.lastName} ${slip.period.month}/${slip.period.year}`,
          severity: 'success',
          metadata: { payslipId: args.id },
        },
      })
      return { ok: true }
    }),
})

/**
 * Marque les bulletins comme payés (flag uniquement — pas d'intégration Wave Phase 4).
 * Voir memory wave-sandbox-skip.md
 */
export const pay = mutation({
  args: {
    payslipIds: v.array(v.id('payslips')),
    method: v.union(
      v.literal('wave'),
      v.literal('orange_money'),
      v.literal('mtn_momo'),
      v.literal('bank_transfer'),
      v.literal('cash'),
    ),
    reference: v.optional(v.string()),
  },
  handler: async (ctx, args) =>
    withOrgRoles(ctx, ['owner', 'admin', 'comptable'], async (octx) => {
      const slips = await Promise.all(args.payslipIds.map((id) => octx.db.get(id)))
      const validSlips = slips.filter(
        (s): s is NonNullable<typeof s> => s !== null && s.organizationId === octx.orgId,
      )
      if (validSlips.length === 0) {
        throw new Error('Aucun bulletin valide trouvé')
      }
      const paidAt = Date.now()
      for (const slip of validSlips) {
        await octx.db.patch(slip._id, {
          status: 'paid',
          paidAt,
          paymentMethod: args.method,
          paymentReference: args.reference,
        })
      }
      const totalNet = validSlips.reduce((s, p) => s + p.netAPayer, 0)
      const identity = (await octx.auth.getUserIdentity())!
      await appendAuditEntry(octx, {
        organizationId: octx.orgId,
        actorId: octx.userId,
        actorName: (identity.name as string) ?? identity.email ?? octx.userId,
        entry: {
          action: `Paiement ${args.method} : ${validSlips.length} bulletins · ${totalNet.toLocaleString('fr-FR')} FCFA`,
          severity: 'high',
          metadata: {
            count: validSlips.length,
            totalNet,
            method: args.method,
            reference: args.reference,
          },
        },
      })
      return { ok: true, count: validSlips.length, totalNet }
    }),
})

export const cancelPayslip = mutation({
  args: { id: v.id('payslips'), reason: v.optional(v.string()) },
  handler: async (ctx, args) =>
    withOrgRoles(ctx, ['owner', 'admin'], async (octx) => {
      const slip = await octx.db.get(args.id)
      if (!slip || slip.organizationId !== octx.orgId) {
        throw new Error('Bulletin introuvable')
      }
      await octx.db.patch(args.id, { status: 'cancelled' })
      const emp = await octx.db.get(slip.employeeId)
      const identity = (await octx.auth.getUserIdentity())!
      await appendAuditEntry(octx, {
        organizationId: octx.orgId,
        actorId: octx.userId,
        actorName: (identity.name as string) ?? identity.email ?? octx.userId,
        entry: {
          action: `Bulletin annulé : ${emp?.firstName} ${emp?.lastName} ${slip.period.month}/${slip.period.year}${args.reason ? ` — ${args.reason}` : ''}`,
          severity: 'high',
          metadata: { payslipId: args.id, reason: args.reason },
        },
      })
      return { ok: true }
    }),
})
