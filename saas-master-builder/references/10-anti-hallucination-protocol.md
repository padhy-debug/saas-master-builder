# The Operating Protocol — Read This First, Always

This file governs how every other file in this skill is meant to be used. It exists to fix one specific, common failure: an AI agent (or a rushed developer) declaring something "done," "secure," "100% working," or "compliant" without ever having actually checked. Everything below is enforceable by asking one question at every step: **can I show the evidence for what I'm about to claim?**

## The core rule

There are exactly three honest things to say about any claim regarding working code, security, or compliance:

1. **"I ran/checked this, and here's the actual output"** — a test result, a build log, a scan report, a filled and reviewed form. This is the only basis for saying something is done.
2. **"This should work, but I haven't verified it"** — a legitimate thing to say, as long as it's said explicitly, not silently upgraded to claim #1.
3. **"I don't know / I didn't check this"** — always acceptable, and always better than fabricating an answer. Guessing confidently is the failure mode this entire file exists to prevent.

Never let a claim of type 2 or 3 get reported to the user as type 1. If a task says "make sure this is secure" and no scan was actually run, the honest response is "I've addressed X, Y, Z from the security checklist, but I haven't run an actual scan against this build yet — here's how to do that" — not "this is secure."

## Specific rules that follow from the core rule

**No fabricated APIs, libraries, or file contents.** Before referencing a function signature, a config key, a file's contents, or a library's behavior, actually look at it (read the file, check the package's actual docs/types) in the current session. If it can't be verified right now, say so instead of describing confident-sounding behavior from memory — package APIs change between versions and memory is not a reliable source here.

**Evidence over assertion for "done."** A task is complete when the relevant check was actually run and passed — the test suite executed (not "the tests should pass"), the build succeeded (not "this should build"), the linter/scanner ran clean (not "this follows best practices"). Paste or reference the actual output, don't summarize a check that didn't happen.

**Distinguish "not run" from "passed."** If a test suite, security scan, or compliance checklist item wasn't actually executed, say explicitly that it wasn't — don't imply it passed by omission. "I didn't run the cross-tenant isolation tests for this change" is a complete, honest, useful sentence.

**No rubber-stamping compliance or security claims.** Never tell a user "this is GDPR/DPDP compliant" or "this passed a security audit" unless an actual audit against actual named criteria was performed and documented. The honest framing is "this addresses requirements X, Y, Z from the checklist; a licensed auditor/legal review is still required before making a compliance claim to a regulator or customer." See files 06 and 08.

**Minimal, scoped changes.** Fix what was asked. Don't silently refactor, rename, or "clean up" adjacent code while doing it — an unrelated change hidden inside a requested fix is how one bug fix quietly introduces three new bugs. If something else looks wrong nearby, name it explicitly and ask, rather than touching it unasked.

**State assumptions instead of silently guessing — especially on high-stakes decisions.** Ambiguity about copy or layout is fine to resolve with a reasonable default. Ambiguity about a security boundary, a data-deletion behavior, a billing amount, or a compliance interpretation should be surfaced explicitly ("I'm assuming X — confirm before this ships") rather than silently decided.

**Destructive actions require confirmation.** Dropping data, force-pushing, revoking licenses in bulk, deleting a tenant, or anything else that isn't reversible gets a stated plan and a confirmation step — never a silent execution because it seemed like the implied next step.

**Test the failure path, not just the happy path.** A feature isn't verified because it worked once with valid input. Before calling something done: what happens with invalid input, an expired token, a missing tenant, a network failure mid-request, a second concurrent request? If those weren't tested, say so.

## A concrete self-check before saying "this is done"

- [ ] Did I actually run this (test, build, scan), or am I describing what I expect to happen?
- [ ] Did I check the failure/edge paths, not only the happy path?
- [ ] If this touches tenant-owned data, did I verify tenant isolation specifically (file 02)?
- [ ] If this adds an endpoint, did I verify authorization, not just authentication?
- [ ] Did I scope the change to exactly what was asked, or did I drift into unrelated edits?
- [ ] If I'm making a security or compliance claim, do I have an actual check's output behind it — or am I describing intent?
- [ ] Would a skeptical senior engineer, reading only my evidence (not my confidence), agree this is actually done?

## Why this matters more than it sounds like it does

A fabricated "it's done, 100%, all good" costs nothing in the moment and costs everything later — a cross-tenant data leak in production, a compliance claim made to a government client that wasn't actually true, an app store submission rejected because the privacy form was filled from assumption instead of an actual SDK audit. The discipline in this file is not bureaucracy for its own sake; it's the difference between software that's actually ready and software that merely sounds ready. An honest "I haven't checked this yet" is always the more useful answer, every single time, than a confident claim that turns out to be wrong.
