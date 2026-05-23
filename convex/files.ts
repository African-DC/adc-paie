/**
 * Convex file storage — bulletins PDF + autres documents.
 *
 * Pattern :
 * 1. Client demande generateUploadUrl (mutation)
 * 2. Client upload PDF blob direct vers Convex storage
 * 3. Client appelle attachPayslipFile(payslipId, storageId) (mutation)
 * 4. Lecteurs récupèrent l'URL via getFileUrl (query)
 *
 * Quotas Convex free tier : 1 GB total storage. Suffit pour ~10 000 bulletins PDF
 * (~50-100 KB chacun).
 */

import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { withOrgRoles, withOrg } from './lib/withOrg'
import { appendAuditEntry } from './lib/auditLog'

/**
 * Pré-requis : user doit avoir payroll:write permission.
 * Retourne une URL d'upload one-time-use.
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) =>
    withOrgRoles(ctx, ['owner', 'admin', 'comptable'], async (octx) => {
      return await octx.storage.generateUploadUrl()
    }),
})

/**
 * Attache un fichier uploadé à un bulletin de paie.
 */
export const attachPayslipFile = mutation({
  args: {
    payslipId: v.id('payslips'),
    storageId: v.id('_storage'),
  },
  handler: async (ctx, args) =>
    withOrgRoles(ctx, ['owner', 'admin', 'comptable'], async (octx) => {
      const slip = await octx.db.get(args.payslipId)
      if (!slip || slip.organizationId !== octx.orgId) {
        throw new Error('Bulletin introuvable')
      }
      // Supprimer l'ancien fichier s'il existe
      if (slip.fileStorageId) {
        await octx.storage.delete(slip.fileStorageId)
      }
      await octx.db.patch(args.payslipId, { fileStorageId: args.storageId })
      const identity = (await octx.auth.getUserIdentity())!
      await appendAuditEntry(octx, {
        organizationId: octx.orgId,
        actorId: octx.userId,
        actorName: (identity.name as string) ?? identity.email ?? octx.userId,
        entry: {
          action: `Bulletin PDF attaché : ${slip.period.month}/${slip.period.year}`,
          severity: 'normal',
          metadata: { payslipId: args.payslipId, storageId: args.storageId },
        },
      })
      return { ok: true }
    }),
})

/**
 * Récupère l'URL signée temporaire d'un fichier stocké.
 */
export const getFileUrl = query({
  args: { storageId: v.id('_storage') },
  handler: async (ctx, args) =>
    withOrg(ctx, async (octx) => {
      // Note : Convex ne permet pas de vérifier l'org du fichier directement,
      // donc on retourne juste l'URL signée. La sécurité est assurée par le fait
      // que les fileStorageId sont stockés dans payslips déjà scopés par org.
      return await octx.storage.getUrl(args.storageId)
    }),
})

/**
 * Récupère l'URL signée d'un bulletin par son ID (vérifie l'org + permissions).
 */
export const getPayslipFileUrl = query({
  args: { payslipId: v.id('payslips') },
  handler: async (ctx, args) =>
    withOrg(ctx, async (octx) => {
      const slip = await octx.db.get(args.payslipId)
      if (!slip || slip.organizationId !== octx.orgId) return null
      // Salarié peut voir ses bulletins uniquement
      if (octx.userRole === 'salarie') {
        const me = await octx.db
          .query('employees')
          .withIndex('by_user', (idx) => idx.eq('userId', octx.userId))
          .first()
        if (!me || slip.employeeId !== me._id) return null
      }
      if (!slip.fileStorageId) return null
      return await octx.storage.getUrl(slip.fileStorageId)
    }),
})

/**
 * Supprime un fichier bulletin (admin only).
 */
export const deletePayslipFile = mutation({
  args: { payslipId: v.id('payslips') },
  handler: async (ctx, args) =>
    withOrgRoles(ctx, ['owner', 'admin'], async (octx) => {
      const slip = await octx.db.get(args.payslipId)
      if (!slip || slip.organizationId !== octx.orgId) {
        throw new Error('Bulletin introuvable')
      }
      if (slip.fileStorageId) {
        await octx.storage.delete(slip.fileStorageId)
        await octx.db.patch(args.payslipId, { fileStorageId: undefined })
      }
      return { ok: true }
    }),
})
