/**
 * SaaS Master Builder - Blueprint 21: Full-Stack Multi-Tenant App Shell
 * Types & Domain Interfaces
 */

export interface Organization {
  id: string;
  name: string;
  slug: string;
  planTier: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'past_due' | 'suspended';
  currentPeriodEnd: string;
  memberCount: number;
}

export interface UserSession {
  userId: string;
  email: string;
  name: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  organizationId: string;
  activeOrganization: Organization;
  availableOrganizations: Organization[];
}

export interface KpiMetric {
  id: string;
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  description: string;
}

export interface AuditFeedItem {
  id: string;
  action: string;
  actorEmail: string;
  resource: string;
  timestamp: string;
  hash: string;
  verified: boolean;
}

export interface LicenseStatus {
  keyId: string;
  tier: string;
  validUntil: string;
  features: string[];
  daysRemaining: number;
  isGracePeriod: boolean;
  isValid: boolean;
}
