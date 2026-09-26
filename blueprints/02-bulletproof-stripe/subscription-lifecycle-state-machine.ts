/**
 * SaaS Subscription Lifecycle State Machine
 * Defines valid subscription states, allowed transitions, and grace period rules.
 */

export type SubscriptionState =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'grace_period'
  | 'suspended'
  | 'canceled'
  | 'expired';

export interface StateTransitionResult {
  allowed: boolean;
  newState: SubscriptionState;
  reason?: string;
  uiAction: 'full_access' | 'banner_warning' | 'read_only' | 'blocked_payment_required';
}

const ALLOWED_TRANSITIONS: Record<SubscriptionState, SubscriptionState[]> = {
  trialing: ['active', 'canceled', 'expired'],
  active: ['past_due', 'canceled'],
  past_due: ['active', 'grace_period', 'suspended', 'canceled'],
  grace_period: ['active', 'suspended', 'canceled'],
  suspended: ['active', 'canceled', 'expired'],
  canceled: ['active'], // Reactivation
  expired: ['active'],  // Resubscription
};

export function transitionSubscription(
  currentState: SubscriptionState,
  targetState: SubscriptionState,
  daysPastDue: number = 0,
  maxGraceDays: number = 7
): StateTransitionResult {
  const allowedNext = ALLOWED_TRANSITIONS[currentState] || [];

  if (!allowedNext.includes(targetState)) {
    return {
      allowed: false,
      newState: currentState,
      reason: `Illegal state transition from ${currentState} to ${targetState}`,
      uiAction: getUIActionForState(currentState),
    };
  }

  // Grace Period Logic
  let effectiveState = targetState;
  if (targetState === 'past_due') {
    if (daysPastDue <= maxGraceDays) {
      effectiveState = 'grace_period';
    } else {
      effectiveState = 'suspended';
    }
  }

  return {
    allowed: true,
    newState: effectiveState,
    uiAction: getUIActionForState(effectiveState),
  };
}

function getUIActionForState(state: SubscriptionState): StateTransitionResult['uiAction'] {
  switch (state) {
    case 'trialing':
    case 'active':
      return 'full_access';
    case 'past_due':
    case 'grace_period':
      return 'banner_warning';
    case 'suspended':
      return 'read_only';
    case 'canceled':
    case 'expired':
      return 'blocked_payment_required';
  }
}
