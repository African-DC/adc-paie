/**
 * Convex queries+mutations pour les salariés (employees).
 *
 * Toutes scopées via withOrg() — multi-tenant strict.
 * Toutes les mutations sensibles écrivent dans le journal d'audit hash-chained.
 *
 * Permissions (rbac.ts) :
 * - employees:read → owner, admin, dro, comptable, salarie (limité à self)
 * - employees:write → owner, admin, dro
 * - employees:terminate → owner, admin, dro
 */

import { v } from 'convex/values'
import { query, mutation } from './_generated/server'
import { withOrg, withOrgRoles } from './lib/withOrg'
import { appendAuditEntry } from './lib/auditLog'

const employeeFields = {
  firstName: v.string(),
  lastName: v.string(),
  matricule: v.string(),
  role: v.string(),
  contract: v.union(
    v.literal('CDI'),
    v.literal('CDD'),
    v.literal('Stage'),
    v.literal('Apprentissage'),
  ),
  brut: v.number(),
  family: v.object({
    situation: v.union(
      v.literal('célibataire'),
      v.literal('marié(e)'),
      v.literal('divorcé(e)'),
      v.literal('veuf/veuve'),
    ),
    kids: v.number(),
  }),
  joinedAt: v.string(),
  cnpsMat: v.optional(v.string()),
  email: v.optional(v.string()),
  phone: v.optional(v.string()),
  address: v.optional(v.string()),
  bankProvider: v.optional(
    v.union(v.literal('wave'), v.literal('orange'), v.literal('mtn'), v.literal('bank')),
  ),
  bankRef: v.optional(v.string()),
  emergencyContact: v.optional(v.string()),
  tauxAT: v.optional(v.number()),
}

export const list = query({
  args: {
    status: v.optional(
      v.union(v.literal('active'), v.literal('leave'), v.literal('terminated')),
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) =>
    withOrg(ctx, async (octx) => {
      const limit = args.limit ?? 200
      let q
      if (args.status) {
        q = octx.db
          .query('employees')
          .withIndex('by_org_status', (idx) =>
            idx.eq('organizationId', octx.orgId).eq('status', args.status!),
          )
      } else {
        q = octx.db
          .query('employees')
          .withIndex('by_org', (idx) => idx.eq('organizationId', octx.orgId))
      }
      return q.order('desc').take(limit)
    }),
})

export const get = query({
  args: { id: v.id('employees') },
  handler: async (ctx, args) =>
    withOrg(ctx, async (octx) => {
      const emp = await octx.db.get(args.id)
      if (!emp || emp.organizationId !== octx.orgId) return null
      // Salarié ne peut voir QUE son propre profil
      if (octx.userRole === 'salarie' && emp.userId !== octx.userId) return null
      return emp
    }),
})

export const getMine = query({
  args: {},
  handler: async (ctx) =>
    withOrg(ctx, async (octx) => {
      const emp = await octx.db
        .query('employees')
        .withIndex('by_user', (idx) => idx.eq('userId', octx.userId))
        .first()
      if (!emp || emp.organizationId !== octx.orgId) return null
      return emp
    }),
})

export const countByStatus = query({
  args: {},
  handler: async (ctx) =>
    withOrg(ctx, async (octx) => {
      const all = await octx.db
        .query('employees')
        .withIndex('by_org', (idx) => idx.eq('organizationId', octx.orgId))
        .collect()
      return {
        total: all.length,
        active: all.filter((e) => e.status === 'active').length,
        onLeave: all.filter((e) => e.status === 'leave').length,
        terminated: all.filter((e) => e.status === 'terminated').length,
      }
    }),
})

export const hire = mutation({
  args: employeeFields,
  handler: async (ctx, args) =>
    withOrgRoles(ctx, ['owner', 'admin', 'dro'], async (octx) => {
      // Vérifier que le matricule est unique dans l'org
      const existing = await octx.db
        .query('employees')
        .withIndex('by_org_matricule', (idx) =>
          idx.eq('organizationId', octx.orgId).eq('matricule', args.matricule),
        )
        .first()
      if (existing) {
        throw new Error(`Matricule ${args.matricule} déjà utilisé dans votre espace`)
      }
      const id = await octx.db.insert('employees', {
        organizationId: octx.orgId,
        status: 'active',
        ...args,
      })
      const identity = (await octx.auth.getUserIdentity())!
      await appendAuditEntry(octx, {
        organizationId: octx.orgId,
        actorId: octx.userId,
        actorName: (identity.name as string) ?? identity.email ?? octx.userId,
        entry: {
          action: `Embauche : ${args.firstName} ${args.lastName} · ${args.role} · ${args.brut.toLocaleString('fr-FR')} FCFA`,
          severity: 'success',
          metadata: { employeeId: id, matricule: args.matricule, brut: args.brut },
        },
      })
      return id
    }),
})

export const update = mutation({
  args: {
    id: v.id('employees'),
    patch: v.object({
      firstName: v.optional(v.string()),
      lastName: v.optional(v.string()),
      role: v.optional(v.string()),
      brut: v.optional(v.number()),
      contract: v.optional(
        v.union(
          v.literal('CDI'),
          v.literal('CDD'),
          v.literal('Stage'),
          v.literal('Apprentissage'),
        ),
      ),
      family: v.optional(
        v.object({
          situation: v.union(
            v.literal('célibataire'),
            v.literal('marié(e)'),
            v.literal('divorcé(e)'),
            v.literal('veuf/veuve'),
          ),
          kids: v.number(),
        }),
      ),
      email: v.optional(v.string()),
      phone: v.optional(v.string()),
      address: v.optional(v.string()),
      bankProvider: v.optional(
        v.union(v.literal('wave'), v.literal('orange'), v.literal('mtn'), v.literal('bank')),
      ),
      bankRef: v.optional(v.string()),
      emergencyContact: v.optional(v.string()),
      cnpsMat: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) =>
    withOrgRoles(ctx, ['owner', 'admin', 'dro'], async (octx) => {
      const emp = await octx.db.get(args.id)
      if (!emp || emp.organizationId !== octx.orgId) {
        throw new Error('Salarié introuvable ou hors de votre organisation')
      }
      const changes = Object.entries(args.patch)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
        .join(', ')
      // Sensible : si le salaire change, audit severity=high
      const severity: 'normal' | 'high' | 'success' =
        args.patch.brut !== undefined && args.patch.brut !== emp.brut ? 'high' : 'normal'
      await octx.db.patch(args.id, args.patch)
      const identity = (await octx.auth.getUserIdentity())!
      await appendAuditEntry(octx, {
        organizationId: octx.orgId,
        actorId: octx.userId,
        actorName: (identity.name as string) ?? identity.email ?? octx.userId,
        entry: {
          action: `Modification ${emp.firstName} ${emp.lastName} → ${changes}`,
          severity,
          metadata: { employeeId: args.id, changes: args.patch },
        },
      })
      return { ok: true }
    }),
})

export const setStatus = mutation({
  args: {
    id: v.id('employees'),
    status: v.union(
      v.literal('active'),
      v.literal('leave'),
      v.literal('terminated'),
    ),
  },
  handler: async (ctx, args) =>
    withOrgRoles(ctx, ['owner', 'admin', 'dro'], async (octx) => {
      const emp = await octx.db.get(args.id)
      if (!emp || emp.organizationId !== octx.orgId) {
        throw new Error('Salarié introuvable')
      }
      await octx.db.patch(args.id, { status: args.status })
      const identity = (await octx.auth.getUserIdentity())!
      const labels = { active: 'réintégré', leave: 'en congé', terminated: 'sorti des effectifs' }
      await appendAuditEntry(octx, {
        organizationId: octx.orgId,
        actorId: octx.userId,
        actorName: (identity.name as string) ?? identity.email ?? octx.userId,
        entry: {
          action: `${emp.firstName} ${emp.lastName} : ${labels[args.status]}`,
          severity: args.status === 'terminated' ? 'high' : 'normal',
          metadata: { employeeId: args.id, status: args.status },
        },
      })
      return { ok: true }
    }),
})

/**
 * Supprime TOUS les employés de l'org active (revoque seedDemo ou wipe complet).
 * Garde le tracking via auditLog. À utiliser via la UI avec un ConfirmDialog.
 */
export const removeAllEmployees = mutation({
  args: {},
  handler: async (ctx) =>
    withOrgRoles(ctx, ['owner'], async (octx) => {
      const all = await octx.db
        .query('employees')
        .withIndex('by_org', (idx) => idx.eq('organizationId', octx.orgId))
        .collect()
      for (const emp of all) {
        await octx.db.delete(emp._id)
      }
      const identity = (await octx.auth.getUserIdentity())!
      await appendAuditEntry(octx, {
        organizationId: octx.orgId,
        actorId: octx.userId,
        actorName: (identity.name as string) ?? identity.email ?? octx.userId,
        entry: {
          action: `Suppression de ${all.length} salarié(s) (revoke démo)`,
          severity: 'high',
          metadata: { count: all.length },
        },
      })
      return { ok: true, count: all.length }
    }),
})

/**
 * Seed démo : injecte 15 employés réalistes pour bootstrap rapide d'un nouvel
 * espace. Idempotent (skip si l'org a déjà des employees).
 */
export const seedDemo = mutation({
  args: {},
  handler: async (ctx) =>
    withOrgRoles(ctx, ['owner', 'admin'], async (octx) => {
      const existing = await octx.db
        .query('employees')
        .withIndex('by_org', (idx) => idx.eq('organizationId', octx.orgId))
        .first()
      if (existing) {
        return { ok: false, reason: 'Espace déjà peuplé' }
      }
      const seedData = [
        { firstName: 'Aïcha', lastName: 'Koné', matricule: 'CI-04812039', role: 'Directrice Générale', contract: 'CDI' as const, brut: 850_000, family: { situation: 'marié(e)' as const, kids: 3 }, joinedAt: '2021-03-15' },
        { firstName: 'Mamadou', lastName: 'Diabaté', matricule: 'CI-04812040', role: 'Comptable senior', contract: 'CDI' as const, brut: 425_000, family: { situation: 'marié(e)' as const, kids: 2 }, joinedAt: '2021-09-01' },
        { firstName: 'Fatou', lastName: 'Traoré', matricule: 'CI-04812041', role: 'Responsable RH', contract: 'CDI' as const, brut: 380_000, family: { situation: 'célibataire' as const, kids: 0 }, joinedAt: '2022-01-10' },
        { firstName: 'Kouassi', lastName: 'Brou', matricule: 'CI-04812042', role: 'Développeur full-stack', contract: 'CDI' as const, brut: 520_000, family: { situation: 'célibataire' as const, kids: 0 }, joinedAt: '2022-06-20' },
        { firstName: 'Yao', lastName: 'Kouamé', matricule: 'CI-04812043', role: 'Commercial terrain', contract: 'CDI' as const, brut: 280_000, family: { situation: 'marié(e)' as const, kids: 1 }, joinedAt: '2022-08-15' },
        { firstName: 'Adama', lastName: 'Bamba', matricule: 'CI-04812044', role: 'Chef de projet', contract: 'CDI' as const, brut: 590_000, family: { situation: 'marié(e)' as const, kids: 2 }, joinedAt: '2023-02-01' },
        { firstName: 'Ramatou', lastName: 'Cissé', matricule: 'CI-04812045', role: 'Assistante de direction', contract: 'CDI' as const, brut: 245_000, family: { situation: 'célibataire' as const, kids: 0 }, joinedAt: '2023-04-12' },
        { firstName: 'Sékou', lastName: 'Touré', matricule: 'CI-04812046', role: 'Caissier principal', contract: 'CDI' as const, brut: 200_000, family: { situation: 'marié(e)' as const, kids: 4 }, joinedAt: '2023-05-22' },
        { firstName: 'Awa', lastName: 'Diallo', matricule: 'CI-04812047', role: 'Designer UI/UX', contract: 'CDI' as const, brut: 460_000, family: { situation: 'célibataire' as const, kids: 0 }, joinedAt: '2023-09-04' },
        { firstName: 'Ibrahim', lastName: 'Camara', matricule: 'CI-04812048', role: 'Agent de maintenance', contract: 'CDI' as const, brut: 165_000, family: { situation: 'marié(e)' as const, kids: 2 }, joinedAt: '2023-11-15' },
        { firstName: 'Bintou', lastName: 'Ouattara', matricule: 'CI-04812049', role: 'Chargée de clientèle', contract: 'CDD' as const, brut: 220_000, family: { situation: 'célibataire' as const, kids: 1 }, joinedAt: '2024-03-01' },
        { firstName: 'Moussa', lastName: 'Sangaré', matricule: 'CI-04812050', role: 'Data Analyst', contract: 'CDI' as const, brut: 510_000, family: { situation: 'célibataire' as const, kids: 0 }, joinedAt: '2024-06-15' },
        { firstName: 'Kadidja', lastName: 'Bakayoko', matricule: 'CI-04812051', role: 'Responsable Marketing', contract: 'CDI' as const, brut: 480_000, family: { situation: 'marié(e)' as const, kids: 1 }, joinedAt: '2024-09-02' },
        { firstName: 'Ousmane', lastName: 'Coulibaly', matricule: 'CI-04812052', role: 'Stagiaire développeur', contract: 'CDD' as const, brut: 120_000, family: { situation: 'célibataire' as const, kids: 0 }, joinedAt: '2025-09-15' },
        { firstName: 'Nadège', lastName: 'Yapo', matricule: 'CI-04812053', role: 'Chargée communication', contract: 'CDI' as const, brut: 320_000, family: { situation: 'marié(e)' as const, kids: 2 }, joinedAt: '2024-01-08' },
      ]
      const inserted: string[] = []
      for (const e of seedData) {
        const id = await octx.db.insert('employees', {
          organizationId: octx.orgId,
          status: 'active',
          ...e,
        })
        inserted.push(id)
      }
      const identity = (await octx.auth.getUserIdentity())!
      await appendAuditEntry(octx, {
        organizationId: octx.orgId,
        actorId: octx.userId,
        actorName: (identity.name as string) ?? identity.email ?? octx.userId,
        entry: {
          action: `Seed démo : ${seedData.length} salariés ajoutés`,
          severity: 'success',
          metadata: { count: seedData.length },
        },
      })
      return { ok: true, count: seedData.length }
    }),
})
