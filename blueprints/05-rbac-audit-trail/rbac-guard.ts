/**
 * Zero-Trust Role-Based Access Control (RBAC) Guard
 * Clean permission matrix with role hierarchy and strict authorization.
 */

export type Role = 'owner' | 'admin' | 'member' | 'billing' | 'viewer';

export type Permission =
  | 'org.update'
  | 'org.delete'
  | 'members.invite'
  | 'members.remove'
  | 'billing.view'
  | 'billing.manage'
  | 'projects.create'
  | 'projects.read'
  | 'projects.update'
  | 'projects.delete'
  | 'audit_logs.view';

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  owner: [
    'org.update',
    'org.delete',
    'members.invite',
    'members.remove',
    'billing.view',
    'billing.manage',
    'projects.create',
    'projects.read',
    'projects.update',
    'projects.delete',
    'audit_logs.view',
  ],
  admin: [
    'org.update',
    'members.invite',
    'members.remove',
    'billing.view',
    'projects.create',
    'projects.read',
    'projects.update',
    'projects.delete',
    'audit_logs.view',
  ],
  billing: [
    'billing.view',
    'billing.manage',
    'projects.read',
  ],
  member: [
    'projects.create',
    'projects.read',
    'projects.update',
  ],
  viewer: [
    'projects.read',
  ],
};

export function hasPermission(role: Role, requiredPermission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(requiredPermission);
}

export function requirePermission(role: Role, requiredPermission: Permission) {
  if (!hasPermission(role, requiredPermission)) {
    const error: any = new Error(`Access denied. Role '${role}' lacks permission '${requiredPermission}'.`);
    error.statusCode = 403;
    throw error;
  }
}
