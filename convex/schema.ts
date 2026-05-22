import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

/**
 * Schéma Convex ADC Paie — Phase 1
 *
 * Multi-tenant strict : toutes les tables métier portent `organizationId`
 * pour le scoping via helper withOrg() — ne JAMAIS accéder à ctx.db.query
 * sans passer par ce helper.
 *
 * Better Auth (organizations + members + users + sessions + invitations)
 * gère ses propres tables via @convex-dev/better-auth component, on n'a pas
 * besoin de les redéclarer ici. On référence juste l'ID via Better Auth
 * session.
 */

export default defineSchema({
  // --- Organization settings (paramètres entreprise étendus) ---
  // Better Auth crée déjà `organization` (name, slug, etc.), ici on ajoute
  // les paramètres métier ADC Paie spécifiques à chaque PME.
  organizationSettings: defineTable({
    organizationId: v.string(), // Better Auth org ID
    ifu: v.string(),
    cnps: v.string(),
    sector: v.string(),
    tauxAT: v.number(),
    city: v.string(),
    convention: v.string(),
    settings: v.object({
      mfa: v.boolean(),
      loginAlert: v.boolean(),
      multiSession: v.boolean(),
      deadlineReminder: v.boolean(),
      monthlyRecap: v.boolean(),
      whatsappAlerts: v.boolean(),
    }),
  }).index('by_org', ['organizationId']),

  // --- Salariés ---
  employees: defineTable({
    organizationId: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    matricule: v.string(),
    role: v.string(),
    contract: v.union(v.literal('CDI'), v.literal('CDD'), v.literal('Stage'), v.literal('Apprentissage')),
    brut: v.number(),
    status: v.union(v.literal('active'), v.literal('leave'), v.literal('terminated')),
    family: v.object({
      situation: v.union(
        v.literal('célibataire'),
        v.literal('marié(e)'),
        v.literal('divorcé(e)'),
        v.literal('veuf/veuve'),
      ),
      kids: v.number(),
    }),
    joinedAt: v.string(), // ISO date
    // Optionnels
    cnpsMat: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    bankProvider: v.optional(v.union(
      v.literal('wave'),
      v.literal('orange'),
      v.literal('mtn'),
      v.literal('bank'),
    )),
    bankRef: v.optional(v.string()),
    emergencyContact: v.optional(v.string()),
    tauxAT: v.optional(v.number()), // override taux org si spécifique
    // Linkage Better Auth si le salarié a aussi un compte (self-service)
    userId: v.optional(v.string()),
  })
    .index('by_org', ['organizationId'])
    .index('by_org_status', ['organizationId', 'status'])
    .index('by_org_matricule', ['organizationId', 'matricule'])
    .index('by_user', ['userId']),

  // --- Bulletins de paie persistés ---
  payslips: defineTable({
    organizationId: v.string(),
    employeeId: v.id('employees'),
    period: v.object({
      year: v.number(),
      month: v.number(),
    }),
    brutMensuel: v.number(),
    brutTotal: v.number(),
    netAPayer: v.number(),
    cotisationsSalarieTotal: v.number(),
    cotisationsEmployeurTotal: v.number(),
    totalImpots: v.number(),
    totalCoutEmployeur: v.number(),
    breakdown: v.any(), // JSON brut complet de @adc/payroll-engine
    status: v.union(
      v.literal('draft'),
      v.literal('validated'),
      v.literal('paid'),
      v.literal('cancelled'),
    ),
    engineVersion: v.string(),
    baremeYear: v.number(),
    fileStorageId: v.optional(v.id('_storage')), // PDF du bulletin
    computedBy: v.string(), // userId
    paidAt: v.optional(v.number()),
    paymentMethod: v.optional(v.string()),
    paymentReference: v.optional(v.string()),
  })
    .index('by_org_period', ['organizationId', 'period.year', 'period.month'])
    .index('by_employee_period', ['employeeId', 'period.year', 'period.month'])
    .index('by_org_status', ['organizationId', 'status']),

  // --- Déclarations légales (CNPS, DGI) ---
  declarations: defineTable({
    organizationId: v.string(),
    type: v.union(
      v.literal('ITS mensuel'),
      v.literal('Bordereau CNPS'),
      v.literal('DISA + DASC annuels'),
      v.literal('État 301 annuel'),
    ),
    period: v.string(),
    dueDate: v.string(),
    status: v.union(
      v.literal('À soumettre'),
      v.literal('En cours'),
      v.literal('Soumis'),
      v.literal('Validé'),
    ),
    amount: v.number(),
    submittedAt: v.optional(v.number()),
    submittedBy: v.optional(v.string()),
    reference: v.optional(v.string()),
    fileStorageId: v.optional(v.id('_storage')),
  })
    .index('by_org', ['organizationId'])
    .index('by_org_status', ['organizationId', 'status']),

  // --- Avances sur salaire ---
  advances: defineTable({
    organizationId: v.string(),
    employeeId: v.id('employees'),
    amount: v.number(),
    requestedAt: v.number(),
    reason: v.string(),
    status: v.union(
      v.literal('pending'),
      v.literal('approved'),
      v.literal('paid'),
      v.literal('rejected'),
    ),
    approvedBy: v.optional(v.string()),
    approvedAt: v.optional(v.number()),
    paidAt: v.optional(v.number()),
    repaymentMonths: v.optional(v.number()),
  })
    .index('by_org', ['organizationId'])
    .index('by_employee', ['employeeId'])
    .index('by_org_status', ['organizationId', 'status']),

  // --- Congés & absences ---
  leaves: defineTable({
    organizationId: v.string(),
    employeeId: v.id('employees'),
    type: v.union(
      v.literal('congé'),
      v.literal('maladie'),
      v.literal('maternité'),
      v.literal('paternité'),
      v.literal('exceptionnel'),
    ),
    startDate: v.string(),
    endDate: v.string(),
    days: v.number(),
    status: v.union(
      v.literal('pending'),
      v.literal('approved'),
      v.literal('rejected'),
      v.literal('cancelled'),
    ),
    requestedAt: v.number(),
    reason: v.optional(v.string()),
    approvedBy: v.optional(v.string()),
    approvedAt: v.optional(v.number()),
  })
    .index('by_org', ['organizationId'])
    .index('by_employee', ['employeeId'])
    .index('by_org_status', ['organizationId', 'status']),

  // --- Pointages / présences ---
  attendance: defineTable({
    organizationId: v.string(),
    employeeId: v.id('employees'),
    date: v.string(),
    present: v.boolean(),
    hoursWorked: v.optional(v.number()),
    reason: v.optional(v.string()),
    recordedBy: v.string(),
  })
    .index('by_org_date', ['organizationId', 'date'])
    .index('by_employee_date', ['employeeId', 'date']),

  // --- Annonces internes ---
  announcements: defineTable({
    organizationId: v.string(),
    title: v.string(),
    content: v.string(),
    pinned: v.boolean(),
    createdBy: v.string(),
  })
    .index('by_org', ['organizationId'])
    .index('by_org_pinned', ['organizationId', 'pinned']),

  // --- Notifications utilisateur ---
  notifications: defineTable({
    organizationId: v.string(),
    userId: v.string(),
    title: v.string(),
    description: v.string(),
    read: v.boolean(),
    type: v.union(v.literal('info'), v.literal('warning'), v.literal('success')),
  })
    .index('by_user_read', ['userId', 'read'])
    .index('by_org', ['organizationId']),

  // --- Journal d'audit avec hash chain ---
  auditLog: defineTable({
    organizationId: v.string(),
    actorId: v.string(),
    actorName: v.string(),
    action: v.string(),
    severity: v.union(v.literal('normal'), v.literal('high'), v.literal('success')),
    ip: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    metadata: v.optional(v.any()),
    prevHash: v.string(), // SHA-256 hex de l'entrée précédente (chain)
    entryHash: v.string(), // SHA-256 hex de cette entrée
    sequenceNumber: v.number(),
  })
    .index('by_org_seq', ['organizationId', 'sequenceNumber']),
})
