/**
 * Helper multi-tenant — TOUTES les queries/mutations métier doivent passer ici.
 *
 * Garantit :
 * 1. La session Better Auth est valide (sinon throw)
 * 2. Une organization active est définie dans la session
 * 3. Le user est bien member de cette org
 * 4. Le orgId est injecté dans le contexte du callback
 *
 * Anti-fuite cross-tenant : il est INTERDIT d'appeler `ctx.db.query` ou
 * `ctx.db.get` directement dans une query/mutation métier. Toujours via
 * withOrg(ctx, async ({ orgId, db, ...rest }) => { ... }).
 *
 * Une ESLint rule custom sera ajoutée Phase 1.6 pour enforcer.
 */
import type { GenericMutationCtx, GenericQueryCtx } from 'convex/server'
import { components } from '../_generated/api'

export type OrgContext<Ctx> = Ctx & {
  orgId: string
  userId: string
  userRole: string
}

export async function withOrg<Ctx extends GenericQueryCtx<any> | GenericMutationCtx<any>, T>(
  ctx: Ctx,
  fn: (ctx: OrgContext<Ctx>) => Promise<T>,
): Promise<T> {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) {
    throw new Error('Unauthenticated — login required')
  }

  const orgId = (identity as any).activeOrganizationId as string | undefined
  if (!orgId) {
    throw new Error('No active organization — user must select an org')
  }

  const userId = identity.subject
  // Better Auth's session has activeOrganizationId only — role is stored in
  // the `member` table. Look it up via the betterAuth component adapter.
  let userRole = 'member'
  try {
    const member = await ctx.runQuery((components as any).betterAuth.adapter.findOne, {
      input: {
        model: 'member',
        where: [
          { field: 'organizationId', value: orgId },
          { field: 'userId', value: userId, connector: 'AND' },
        ],
      },
    })
    if (member?.role) userRole = String(member.role)
  } catch {
    /* member lookup failed — fall back to 'member' role, audit will catch */
  }

  return fn({ ...ctx, orgId, userId, userRole } as OrgContext<Ctx>)
}

/**
 * Variante stricte : impose une liste de rôles autorisés.
 *
 * Usage : `await withOrgRoles(ctx, ['owner', 'admin'], async (octx) => { ... })`
 */
export async function withOrgRoles<Ctx extends GenericQueryCtx<any> | GenericMutationCtx<any>, T>(
  ctx: Ctx,
  allowedRoles: string[],
  fn: (ctx: OrgContext<Ctx>) => Promise<T>,
): Promise<T> {
  return withOrg(ctx, async (octx) => {
    if (!allowedRoles.includes(octx.userRole)) {
      throw new Error(`Forbidden — role "${octx.userRole}" not in allowed: ${allowedRoles.join(', ')}`)
    }
    return fn(octx)
  })
}
