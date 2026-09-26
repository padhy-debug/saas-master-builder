# Pre-Release Security Checklist

> Derived from `references/08-security-vulnerability-scanning.md`. Every box needs an actual check behind it — link the CI run, scan report, or test output next to each item, don't just tick it from memory.

## Access control
- [ ] Every new endpoint has an authorization test (not just authentication) — evidence:
- [ ] Cross-tenant isolation test suite passes — evidence:
- [ ] Admin/internal endpoints require elevated auth and aren't reachable from the open internet — evidence:

## Automated scanning (CI-wired, not manual)
- [ ] SAST scan clean (Semgrep/CodeQL or equivalent) — evidence:
- [ ] Dependency/SCA scan — no unresolved critical/high vulnerabilities — evidence:
- [ ] Secret scan clean (gitleaks/truffleHog) — evidence:
- [ ] Container image scan (if containerized) — evidence:
- [ ] IaC scan (tfsec/Checkov, if using Terraform) — evidence:
- [ ] DAST baseline scan against staging (OWASP ZAP or equivalent) — evidence:

## OWASP API Top 10 spot-check
- [ ] BOLA — object-level authorization tested per resource
- [ ] Broken authentication — rate limiting on auth endpoints confirmed
- [ ] Object property level authorization — no client-writable privileged fields (role, isAdmin, tenantId, etc.)
- [ ] Resource consumption limits — pagination/size/rate limits present
- [ ] Function-level authorization — admin routes checked server-side, not just hidden in UI
- [ ] SSRF — any user-supplied URL fetch is restricted/allowlisted
- [ ] Security misconfiguration — CORS allowlist explicit, no verbose errors in prod
- [ ] API inventory — no forgotten/unmonitored old API versions still live

## Data protection
- [ ] TLS enforced everywhere, HSTS enabled
- [ ] Sensitive fields encrypted at rest
- [ ] Production error responses don't leak stack traces/internal details

## Mobile (if applicable)
- [ ] Debug logging/dev endpoints stripped from release build
- [ ] Secrets/tokens not stored in plaintext on-device
- [ ] MASVS categories reviewed (see references/08)

## Sign-off
- [ ] Findings reviewed and either fixed or explicitly accepted-as-risk with owner named
- [ ] For enterprise/government release: third-party pentest scheduled/completed — evidence:
