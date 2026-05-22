/**
 * Permissions matrix — RBAC pour ADC Paie.
 *
 * Rôles (alignés avec Better Auth organizations) :
 * - `owner` : propriétaire de l'organisation (ne peut PAS être retiré sauf via transfert)
 * - `admin` : tous les droits sauf transfer org
 * - `dro` : gestion RH (salariés, congés, embauches)
 * - `comptable` : paie, déclarations légales, exports
 * - `salarie` : self-service (ses propres bulletins, congés, profil)
 *
 * Helpers à utiliser dans les mutations Convex pour vérifier les droits :
 *
 * ```ts
 * await withOrgRoles(ctx, hasPermission(['employees:write']), async (octx) => { ... })
 * ```
 */

export type Role = 'owner' | 'admin' | 'dro' | 'comptable' | 'salarie'

export type Permission =
  | 'organization:read'
  | 'organization:write'
  | 'organization:delete'
  | 'members:read'
  | 'members:invite'
  | 'members:remove'
  | 'members:change_role'
  | 'employees:read'
  | 'employees:write'
  | 'employees:terminate'
  | 'payroll:read'
  | 'payroll:write'
  | 'payroll:validate'
  | 'payroll:pay'
  | 'advances:read'
  | 'advances:approve'
  | 'leaves:read'
  | 'leaves:approve'
  | 'attendance:read'
  | 'attendance:write'
  | 'declarations:read'
  | 'declarations:submit'
  | 'announcements:read'
  | 'announcements:write'
  | 'reports:read'
  | 'settings:read'
  | 'settings:write'
  | 'audit:read'
  | 'audit:export'
  | 'self:read'
  | 'self:write'

const PERMISSIONS_BY_ROLE: Record<Role, Permission[]> = {
  owner: [
    'organization:read', 'organization:write', 'organization:delete',
    'members:read', 'members:invite', 'members:remove', 'members:change_role',
    'employees:read', 'employees:write', 'employees:terminate',
    'payroll:read', 'payroll:write', 'payroll:validate', 'payroll:pay',
    'advances:read', 'advances:approve',
    'leaves:read', 'leaves:approve',
    'attendance:read', 'attendance:write',
    'declarations:read', 'declarations:submit',
    'announcements:read', 'announcements:write',
    'reports:read',
    'settings:read', 'settings:write',
    'audit:read', 'audit:export',
    'self:read', 'self:write',
  ],
  admin: [
    'organization:read', 'organization:write',
    'members:read', 'members:invite', 'members:remove', 'members:change_role',
    'employees:read', 'employees:write', 'employees:terminate',
    'payroll:read', 'payroll:write', 'payroll:validate', 'payroll:pay',
    'advances:read', 'advances:approve',
    'leaves:read', 'leaves:approve',
    'attendance:read', 'attendance:write',
    'declarations:read', 'declarations:submit',
    'announcements:read', 'announcements:write',
    'reports:read',
    'settings:read', 'settings:write',
    'audit:read', 'audit:export',
    'self:read', 'self:write',
  ],
  dro: [
    'organization:read',
    'members:read',
    'employees:read', 'employees:write', 'employees:terminate',
    'payroll:read',
    'advances:read', 'advances:approve',
    'leaves:read', 'leaves:approve',
    'attendance:read', 'attendance:write',
    'announcements:read', 'announcements:write',
    'reports:read',
    'self:read', 'self:write',
  ],
  comptable: [
    'organization:read',
    'members:read',
    'employees:read',
    'payroll:read', 'payroll:write', 'payroll:validate', 'payroll:pay',
    'advances:read',
    'leaves:read',
    'attendance:read',
    'declarations:read', 'declarations:submit',
    'reports:read',
    'self:read', 'self:write',
  ],
  salarie: [
    'self:read', 'self:write',
  ],
}

export function hasPermission(role: string, permission: Permission): boolean {
  const perms = PERMISSIONS_BY_ROLE[role as Role]
  if (!perms) return false
  return perms.includes(permission)
}

export function requirePermission(role: string, permission: Permission): void {
  if (!hasPermission(role, permission)) {
    throw new Error(`Forbidden — role "${role}" lacks permission "${permission}"`)
  }
}

export function rolesWithPermission(permission: Permission): Role[] {
  return (Object.keys(PERMISSIONS_BY_ROLE) as Role[]).filter((role) =>
    PERMISSIONS_BY_ROLE[role].includes(permission),
  )
}
