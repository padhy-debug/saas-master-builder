# Go-Live / Launch Checklist

> Combines references/06-compliance.md, 07-app-store-readiness.md, and 08-security-vulnerability-scanning.md into one release gate. Nothing here is checked off from memory — link real evidence.

## Architecture & multi-tenancy (files 01, 02)
- [ ] Tenant isolation model documented and enforced (RLS or equivalent) — evidence:
- [ ] Cross-tenant isolation automated tests passing — evidence:
- [ ] Observability in place: structured logs, error tracking, at least basic uptime/error alerting

## Licensing (file 03) — if applicable
- [ ] Offline grace-period behavior tested (simulate network loss) — evidence:
- [ ] License token verification tested with expired/tampered/revoked tokens — evidence:

## Admin panel & audit logs (file 04)
- [ ] Audit log capturing all required event categories — evidence:
- [ ] Audit log confirmed append-only (attempt an update/delete and confirm it's blocked) — evidence:
- [ ] RBAC enforced server-side on every privileged action — evidence:
- [ ] Impersonation requires reason + is time-boxed + is logged — evidence:

## Web/app contract integrity (file 05)
- [ ] API contract (OpenAPI) is the generation source for both clients — evidence:
- [ ] Contract tests passing in CI — evidence:
- [ ] Idempotency keys supported on non-idempotent mutations — evidence:

## Compliance (file 06)
- [ ] Privacy Policy / ToS reviewed by counsel and live
- [ ] Consent flow is granular and withdrawable
- [ ] Data deletion flow actually implemented and tested, not just documented
- [ ] Applicable frameworks confirmed against current official sources (dates/rules re-verified, not assumed from a cached doc)
- [ ] Government-specific requirements confirmed if applicable (GIGW, CERT-In audit, data localization, empanelled cloud)

## Security (file 08)
- [ ] `SECURITY_CHECKLIST.md` fully completed with evidence
- [ ] No unresolved critical/high vulnerabilities in latest scan

## App store readiness (file 07) — if shipping a mobile app
- [ ] Data Safety/App Privacy form audited against actual SDK behavior, not filled from memory
- [ ] Every permission justified and mapped to a visible feature
- [ ] Screenshots/description match the exact submitted build
- [ ] Digital goods route through platform billing
- [ ] Account deletion available in-app
- [ ] Closed/internal testing completed with real devices before public submission
- [ ] Launch date has a buffer for at least one possible review cycle + resubmission

## Frontend quality (file 09)
- [ ] Empty/loading/error/permission-denied states designed, not skipped
- [ ] Accessibility basics checked (contrast, focus states, keyboard nav)

## Final sign-off
- [ ] Every unchecked box above has an explicit owner and date, not silently ignored
- [ ] A named human (not just an AI agent) has reviewed and approved this checklist before public launch
