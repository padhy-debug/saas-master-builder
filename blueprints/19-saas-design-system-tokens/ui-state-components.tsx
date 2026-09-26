import React from 'react';

/**
 * SaaS Master Builder - Production UI State Components
 * High-converting, zero-dependency, accessible states for modern SaaS applications.
 */

// ---------------------------------------------------------------------------
// 1. Empty State Component
// ---------------------------------------------------------------------------
export interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  icon,
}) => {
  return (
    <div
      role="region"
      aria-label={title}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        textAlign: 'center',
        background: 'var(--bg-secondary, #fafafa)',
        border: '1px dashed var(--border-strong, #e2e8f0)',
        borderRadius: 'var(--radius-lg, 16px)',
        margin: '1.5rem 0',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'var(--brand-surface, #eff6ff)',
          color: 'var(--brand-primary, #2563eb)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
          fontSize: '24px',
        }}
      >
        {icon || '📭'}
      </div>
      <h3
        style={{
          fontSize: '1.125rem',
          fontWeight: 600,
          color: 'var(--text-primary, #0f172a)',
          margin: '0 0 0.5rem 0',
          fontFamily: 'var(--font-sans, sans-serif)',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: '0.875rem',
          color: 'var(--text-secondary, #64748b)',
          maxWidth: '420px',
          margin: '0 0 1.5rem 0',
          lineHeight: 1.5,
          fontFamily: 'var(--font-sans, sans-serif)',
        }}
      >
        {description}
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            style={{
              padding: '0.625rem 1.25rem',
              backgroundColor: 'var(--brand-primary, #2563eb)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 'var(--radius-md, 8px)',
              fontWeight: 500,
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease',
            }}
          >
            {actionLabel}
          </button>
        )}
        {secondaryActionLabel && onSecondaryAction && (
          <button
            onClick={onSecondaryAction}
            style={{
              padding: '0.625rem 1.25rem',
              backgroundColor: 'transparent',
              color: 'var(--text-primary, #0f172a)',
              border: '1px solid var(--border-strong, #cbd5e1)',
              borderRadius: 'var(--radius-md, 8px)',
              fontWeight: 500,
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            {secondaryActionLabel}
          </button>
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 2. Loading Skeleton Components (with Shimmer effect)
// ---------------------------------------------------------------------------
export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '1rem',
  borderRadius = 'var(--radius-sm, 4px)',
  style,
}) => {
  return (
    <div
      aria-hidden="true"
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: 'var(--bg-tertiary, #e2e8f0)',
        backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0) 0, rgba(255,255,255,0.2) 20%, rgba(255,255,255,0.5) 60%, rgba(255,255,255,0))',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        ...style,
      }}
    />
  );
};

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 4,
}) => {
  return (
    <div
      role="status"
      aria-label="Loading content"
      style={{
        width: '100%',
        border: '1px solid var(--border-subtle, #e2e8f0)',
        borderRadius: 'var(--radius-md, 8px)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          padding: '1rem',
          backgroundColor: 'var(--bg-secondary, #f8fafc)',
          borderBottom: '1px solid var(--border-subtle, #e2e8f0)',
          gap: '1rem',
        }}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} height="1.25rem" width="70%" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            padding: '1rem',
            borderBottom: r < rows - 1 ? '1px solid var(--border-subtle, #f1f5f9)' : 'none',
            gap: '1rem',
            alignItems: 'center',
          }}
        >
          {Array.from({ length: columns }).map((_, c) => (
            <Skeleton key={c} height="1rem" width={c === 0 ? '85%' : '60%'} />
          ))}
        </div>
      ))}
    </div>
  );
};

// ---------------------------------------------------------------------------
// 3. Error Boundary Fallback Screen
// ---------------------------------------------------------------------------
export interface ErrorFallbackProps {
  error?: Error;
  resetErrorBoundary?: () => void;
  supportEmail?: string;
  incidentId?: string;
}

export const ErrorBoundaryFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
  supportEmail = 'support@example.com',
  incidentId = `ERR-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
}) => {
  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        padding: '2.5rem 1.5rem',
        textAlign: 'center',
        background: 'var(--bg-primary, #ffffff)',
        color: 'var(--text-primary, #0f172a)',
        borderRadius: 'var(--radius-lg, 16px)',
        border: '1px solid var(--danger, #ef4444)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.1)',
          color: 'var(--danger, #ef4444)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px',
          marginBottom: '1rem',
        }}
      >
        ⚠️
      </div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>
        Something unexpected went wrong
      </h2>
      <p style={{ color: 'var(--text-secondary, #64748b)', maxWidth: '460px', margin: '0 0 1rem 0', fontSize: '0.875rem' }}>
        We have logged this issue and our team has been notified. If this persists, quote the reference ID below.
      </p>
      <div
        style={{
          background: 'var(--bg-secondary, #f8fafc)',
          padding: '0.5rem 1rem',
          borderRadius: 'var(--radius-sm, 4px)',
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '0.75rem',
          color: 'var(--text-muted, #94a3b8)',
          marginBottom: '1.5rem',
          border: '1px solid var(--border-subtle, #e2e8f0)',
        }}
      >
        Incident Reference: <strong>{incidentId}</strong>
      </div>
      {error && process.env.NODE_ENV !== 'production' && (
        <pre
          style={{
            maxWidth: '600px',
            overflowX: 'auto',
            textAlign: 'left',
            padding: '1rem',
            background: 'var(--bg-tertiary, #0f172a)',
            color: '#f8fafc',
            borderRadius: 'var(--radius-md, 8px)',
            fontSize: '0.75rem',
            marginBottom: '1.5rem',
          }}
        >
          {error.message}
        </pre>
      )}
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        {resetErrorBoundary && (
          <button
            onClick={resetErrorBoundary}
            style={{
              padding: '0.625rem 1.25rem',
              backgroundColor: 'var(--brand-primary, #2563eb)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 'var(--radius-md, 8px)',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
        )}
        <a
          href={`mailto:${supportEmail}?subject=Support Incident ${incidentId}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0.625rem 1.25rem',
            backgroundColor: 'transparent',
            color: 'var(--text-primary, #0f172a)',
            border: '1px solid var(--border-strong, #cbd5e1)',
            borderRadius: 'var(--radius-md, 8px)',
            fontWeight: 500,
            textDecoration: 'none',
            fontSize: '0.875rem',
          }}
        >
          Contact Support
        </a>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 4. High-Converting Subscription Paywall Modal
// ---------------------------------------------------------------------------
export interface PaywallModalProps {
  isOpen: boolean;
  featureName: string;
  requiredPlan: 'Pro' | 'Enterprise';
  currentPlan?: string;
  onUpgrade: () => void;
  onClose: () => void;
  perks?: string[];
}

export const SubscriptionPaywallModal: React.FC<PaywallModalProps> = ({
  isOpen,
  featureName,
  requiredPlan,
  currentPlan = 'Free',
  onUpgrade,
  onClose,
  perks = [
    'Unlimited seats and team members',
    'Enterprise grade 99.99% uptime SLA',
    'Custom domain & white-label branding',
    'Priority 24/7 dedicated support',
  ],
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="paywall-title"
    >
      <div
        style={{
          backgroundColor: 'var(--bg-primary, #ffffff)',
          color: 'var(--text-primary, #0f172a)',
          borderRadius: 'var(--radius-lg, 16px)',
          maxWidth: '480px',
          width: '100%',
          padding: '2rem',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close modal"
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'transparent',
            border: 'none',
            fontSize: '1.25rem',
            cursor: 'pointer',
            color: 'var(--text-muted, #94a3b8)',
          }}
        >
          ✕
        </button>
        <div
          style={{
            display: 'inline-block',
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            backgroundColor: 'var(--brand-surface, #eff6ff)',
            color: 'var(--brand-primary, #2563eb)',
            fontSize: '0.75rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.75rem',
          }}
        >
          Upgrade to {requiredPlan}
        </div>
        <h3 id="paywall-title" style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
          Unlock {featureName}
        </h3>
        <p style={{ color: 'var(--text-secondary, #64748b)', fontSize: '0.875rem', lineHeight: 1.5, margin: '0 0 1.5rem 0' }}>
          {featureName} is an exclusive capability reserved for our {requiredPlan} tier. You are currently on the {currentPlan} plan.
        </p>

        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.75rem 0' }}>
          {perks.map((perk, index) => (
            <li
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                color: 'var(--text-primary, #334155)',
                marginBottom: '0.5rem',
              }}
            >
              <span style={{ color: 'var(--success, #10b981)', fontWeight: 'bold' }}>✓</span>
              {perk}
            </li>
          ))}
        </ul>

        <button
          onClick={onUpgrade}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: 'var(--brand-primary, #2563eb)',
            color: '#ffffff',
            border: 'none',
            borderRadius: 'var(--radius-md, 8px)',
            fontWeight: 600,
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'opacity 0.2s ease',
          }}
        >
          Upgrade Now to {requiredPlan} →
        </button>
      </div>
    </div>
  );
};
