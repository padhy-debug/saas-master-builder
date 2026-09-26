/**
 * High-Performance In-Memory Feature Flags & Entitlements Engine
 * Evaluates feature access in < 1ms with percentage rollouts, tenant overrides, and plan gating.
 */

import crypto from 'crypto';

export interface PlanEntitlement {
  planTier: 'free' | 'starter' | 'pro' | 'enterprise';
  features: Set<string>;
  limits: Record<string, number>; // e.g. { maxMembers: 10, maxExports: 100 }
}

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  rolloutPercentage?: number; // 0 to 100
  allowedTenantIds?: Set<string>;
}

export class FeatureFlagsEngine {
  private flags: Map<string, FeatureFlag> = new Map();
  private planEntitlements: Map<string, PlanEntitlement> = new Map();

  constructor() {
    this.initDefaultPlans();
  }

  private initDefaultPlans() {
    this.planEntitlements.set('free', {
      planTier: 'free',
      features: new Set(['basic_analytics', 'core_dashboard']),
      limits: { maxMembers: 3, maxStorageMb: 500 },
    });
    this.planEntitlements.set('pro', {
      planTier: 'pro',
      features: new Set(['basic_analytics', 'core_dashboard', 'advanced_reports', 'export_data', 'api_access']),
      limits: { maxMembers: 25, maxStorageMb: 10000 },
    });
    this.planEntitlements.set('enterprise', {
      planTier: 'enterprise',
      features: new Set(['basic_analytics', 'core_dashboard', 'advanced_reports', 'export_data', 'api_access', 'sso_saml', 'audit_logs']),
      limits: { maxMembers: 999999, maxStorageMb: 500000 },
    });
  }

  setFlag(flag: FeatureFlag) {
    this.flags.set(flag.key, flag);
  }

  // Evaluates boolean feature flag (Canary rollouts & Kill switches)
  isFeatureEnabled(flagKey: string, tenantId: string, userId?: string): boolean {
    const flag = this.flags.get(flagKey);
    if (!flag || !flag.enabled) return false;

    // Check explicit tenant whitelist override
    if (flag.allowedTenantIds && flag.allowedTenantIds.has(tenantId)) {
      return true;
    }

    // Check percentage rollout (deterministic hash on tenant/user ID)
    if (typeof flag.rolloutPercentage === 'number' && flag.rolloutPercentage < 100) {
      const subject = userId || tenantId;
      const hash = crypto.createHash('sha256').update(`${flagKey}:${subject}`).digest('hex');
      const bucket = parseInt(hash.substring(0, 8), 16) % 100;
      return bucket < flag.rolloutPercentage;
    }

    return true;
  }

  // Evaluates plan-based monetization entitlements
  hasEntitlement(planTier: string, featureName: string): boolean {
    const plan = this.planEntitlements.get(planTier) || this.planEntitlements.get('free')!;
    return plan.features.has(featureName);
  }

  getQuotaLimit(planTier: string, quotaName: string): number {
    const plan = this.planEntitlements.get(planTier) || this.planEntitlements.get('free')!;
    return plan.limits[quotaName] ?? 0;
  }
}
