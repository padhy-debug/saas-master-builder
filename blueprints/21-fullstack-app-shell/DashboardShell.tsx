import React, { useState } from 'react';
import { Organization, UserSession, KpiMetric, AuditFeedItem, LicenseStatus } from './types';
import './app-shell.css';

interface DashboardShellProps {
  initialSession: UserSession;
  metrics: KpiMetric[];
  recentAudits: AuditFeedItem[];
  license: LicenseStatus;
  onTenantSwitch?: (orgId: string) => void;
  onUpgradePlan?: () => void;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({
  initialSession,
  metrics,
  recentAudits,
  license,
  onTenantSwitch,
  onUpgradePlan
}) => {
  const [session, setSession] = useState<UserSession>(initialSession);
  const [activeTab, setActiveTab] = useState<'overview' | 'customers' | 'billing' | 'audit' | 'settings'>('overview');
  const [uiState, setUiState] = useState<'success' | 'loading' | 'empty' | 'error'>('success');

  const handleOrgChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const found = session.availableOrganizations.find(o => o.id === selectedId);
    if (found) {
      setSession(prev => ({
        ...prev,
        organizationId: found.id,
        activeOrganization: found
      }));
      if (onTenantSwitch) onTenantSwitch(found.id);
    }
  };

  return (
    <div className="saas-app-container">
      {/* Sidebar */}
      <aside className="saas-sidebar">
        <div className="saas-brand">
          <div className="saas-brand-icon">S</div>
          <span className="saas-brand-title">SaaS Master OS</span>
        </div>

        {/* Tenant Switcher */}
        <div className="tenant-selector">
          <span className="tenant-label">Current Organization</span>
          <div className="tenant-active-row">
            <select
              value={session.organizationId}
              onChange={handleOrgChange}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                outline: 'none',
                width: '100%'
              }}
            >
              {session.availableOrganizations.map(org => (
                <option key={org.id} value={org.id} style={{ background: '#12161f' }}>
                  {org.name} ({org.planTier.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Navigation Items */}
        <ul className="saas-nav-list">
          <li className={`saas-nav-item ${activeTab === 'overview' ? 'active' : ''}`}>
            <a href="#overview" onClick={() => setActiveTab('overview')}>📊 Overview & KPIs</a>
          </li>
          <li className={`saas-nav-item ${activeTab === 'customers' ? 'active' : ''}`}>
            <a href="#customers" onClick={() => setActiveTab('customers')}>👥 Tenant Customers</a>
          </li>
          <li className={`saas-nav-item ${activeTab === 'billing' ? 'active' : ''}`}>
            <a href="#billing" onClick={() => setActiveTab('billing')}>💳 Stripe & Billing</a>
          </li>
          <li className={`saas-nav-item ${activeTab === 'audit' ? 'active' : ''}`}>
            <a href="#audit" onClick={() => setActiveTab('audit')}>🛡️ Immutable Audit Log</a>
          </li>
          <li className={`saas-nav-item ${activeTab === 'settings' ? 'active' : ''}`}>
            <a href="#settings" onClick={() => setActiveTab('settings')}>⚙️ Settings & RLS</a>
          </li>
        </ul>

        {/* License Verification Badge */}
        <div style={{ marginTop: 'auto', padding: '0.75rem', background: '#181e2b', borderRadius: '8px', border: '1px solid #232b3e' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#9aa7c0' }}>License (Ed25519)</span>
            <span className="tenant-badge">{license.isValid ? 'VERIFIED' : 'EXPIRED'}</span>
          </div>
          <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{license.tier} Plan</div>
          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Expires in {license.daysRemaining} days</div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="saas-main">
        {/* Top Header */}
        <header className="saas-header">
          <div className="saas-header-title">
            {session.activeOrganization.name} &bull; Enterprise Console
          </div>

          <div className="saas-header-actions">
            {/* UI State Switcher Demo */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.8rem' }}>
              <span style={{ color: '#64748b' }}>State Demo:</span>
              <button onClick={() => setUiState('success')} style={{ background: uiState === 'success' ? '#3b82f6' : '#1f2738', color: '#fff', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}>Normal</button>
              <button onClick={() => setUiState('loading')} style={{ background: uiState === 'loading' ? '#3b82f6' : '#1f2738', color: '#fff', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}>Loading</button>
              <button onClick={() => setUiState('empty')} style={{ background: uiState === 'empty' ? '#3b82f6' : '#1f2738', color: '#fff', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}>Empty</button>
              <button onClick={() => setUiState('error')} style={{ background: uiState === 'error' ? '#ef4444' : '#1f2738', color: '#fff', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}>Error</button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                {session.name.charAt(0)}
              </div>
              <div style={{ fontSize: '0.85rem' }}>
                <div>{session.name}</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{session.role.toUpperCase()}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="saas-content">
          {uiState === 'loading' && (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#9aa7c0' }}>
              <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              <div style={{ marginTop: '1rem', fontWeight: 600 }}>Verifying PostgreSQL RLS Session & Loading Tenant Metrics...</div>
            </div>
          )}

          {uiState === 'empty' && (
            <div style={{ padding: '4rem 2rem', textAlign: 'center', background: '#181e2b', borderRadius: '12px', border: '1px dashed #344059' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📦</div>
              <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>No Data Found for this Tenant</h3>
              <p style={{ color: '#9aa7c0', maxWidth: '420px', margin: '0 auto 1.5rem auto' }}>
                Your organization is completely isolated via PostgreSQL Row-Level Security. Create your first record below.
              </p>
              <button style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
                + Create Initial Entity
              </button>
            </div>
          )}

          {uiState === 'error' && (
            <div style={{ padding: '2rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '8px', color: '#fca5a5' }}>
              <h4 style={{ margin: 0, marginBottom: '0.5rem' }}>⚠️ Multi-Tenant Verification Exception</h4>
              <p style={{ fontSize: '0.9rem', margin: 0 }}>
                Law 1 Violation Intercepted: Query without organization_id scoping was blocked by PostgreSQL kernel RLS.
              </p>
              <button onClick={() => setUiState('success')} style={{ marginTop: '1rem', background: '#ef4444', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>
                Reset to Secure State
              </button>
            </div>
          )}

          {uiState === 'success' && (
            <>
              {/* KPI Cards */}
              <div className="kpi-grid">
                {metrics.map(kpi => (
                  <div key={kpi.id} className="kpi-card">
                    <div className="kpi-label">{kpi.label}</div>
                    <div className="kpi-value">{kpi.value}</div>
                    <div className="kpi-footer">
                      <span className={kpi.trend === 'up' ? 'kpi-trend-up' : 'kpi-trend-down'}>
                        {kpi.change}
                      </span>
                      <span style={{ color: '#64748b' }}>{kpi.description}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Two Column Section */}
              <div className="dashboard-columns">
                {/* Billing & Subscription */}
                <div className="card">
                  <div className="card-header">
                    <span className="card-title">Billing & Stripe Monetization</span>
                    <span className="tenant-badge">{session.activeOrganization.planTier.toUpperCase()}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <p style={{ fontSize: '0.9rem', color: '#9aa7c0', margin: 0 }}>
                      Current cycle renews on <strong>{session.activeOrganization.currentPeriodEnd}</strong>.
                      Protected by idempotent webhook event deduplication and 7-day dunning state machine.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button
                        onClick={onUpgradePlan}
                        style={{
                          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                          color: '#fff',
                          border: 'none',
                          padding: '0.65rem 1.25rem',
                          borderRadius: '6px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Upgrade to Enterprise
                      </button>
                      <button
                        style={{
                          background: '#1f2738',
                          color: '#f0f4fc',
                          border: '1px solid #344059',
                          padding: '0.65rem 1.25rem',
                          borderRadius: '6px',
                          fontWeight: 500,
                          cursor: 'pointer'
                        }}
                      >
                        Stripe Customer Portal
                      </button>
                    </div>
                  </div>
                </div>

                {/* Audit Activity Feed */}
                <div className="card">
                  <div className="card-header">
                    <span className="card-title">Immutable Audit Trail</span>
                    <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>SHA-256 VERIFIED</span>
                  </div>
                  <ul className="audit-list">
                    {recentAudits.map(item => (
                      <li key={item.id} className="audit-item">
                        <div>
                          <div className="audit-action">{item.action}</div>
                          <div className="audit-actor">{item.actorEmail} &bull; {item.timestamp}</div>
                        </div>
                        <span className="audit-hash">{item.hash.substring(0, 10)}...</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};
