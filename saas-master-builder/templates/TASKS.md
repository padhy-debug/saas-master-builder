# Task Tracker

> Nothing in the "Done" column without something in the "Evidence" column — a test run, a scan output, a reviewed checklist. See references/10-anti-hallucination-protocol.md. "Looks right" is not evidence.

| Task | Status | Evidence | Owner | Notes |
|---|---|---|---|---|
| Example: Add tenant isolation test suite | In progress | — | | Blocking release until cross-tenant test passes |
| Example: License offline grace-period logic | Done | `npm test -- license.spec.ts` — 14/14 passing, output linked in PR #42 | | |
| Example: DPDP consent flow | Blocked | — | | Waiting on legal review of consent copy |

## Status definitions
- **Planned** — not started
- **In progress** — actively being worked
- **Blocked** — cannot proceed, reason stated in Notes
- **Needs verification** — implemented, but the check (test/scan/review) hasn't been run yet — do not mark Done
- **Done** — implemented **and** verified, with evidence linked

## Quarantined issues (found but not fixed yet)
> If something unrelated is discovered while working on a task, log it here instead of silently fixing it mid-change (see the minimal-scope rule in the protocol).

| Issue found | Found while working on | Severity | Logged date |
|---|---|---|---|
| | | | |
