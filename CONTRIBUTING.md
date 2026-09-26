# Contributing to SaaS Master Builder

Thank you for your interest in contributing to **SaaS Master Builder**! 

Our mission is to establish the gold standard for AI-driven and human SaaS development — eliminating hallucinations, cross-tenant leaks, and billing bugs.

---

## Code of Conduct

We are committed to providing a friendly, safe, and welcoming environment for all contributors. Respectful collaboration and rigorous engineering verification are our guiding principles.

---

## How Can You Contribute?

1. **Submitting New Production Blueprints**:
   - Have a battle-tested blueprint for Auth (e.g. Better Auth / Supabase Auth), background job orchestration (BullMQ / Inngest), or multi-region data replication?
   - Ensure your blueprint includes:
     - SQL / ORM Schema definitions.
     - Production implementation code with error handling.
     - Automated test suite (e.g. Vitest).
     - Clear documentation in Markdown.

2. **Enhancing Static Audit Rules**:
   - Add new security or anti-pattern detectors to `scripts/audit-engine.js`.
   - Ensure regex rules minimize false positives.

3. **Improving Reference Guides & Templates**:
   - Suggest improvements to compliance guides, app-store review checklists, or disaster recovery runbooks.

---

## Verification Before Pull Request

Before submitting any Pull Request:
```bash
# 1. Run static analysis
npm run audit

# 2. Check evidence integrity
npm run check-evidence

# 3. Run doctor diagnostics
npm run doctor
```

All contributions must follow the **Zero-Hallucination Evidence Protocol**: claims of working features must include verifiable test outputs in the PR description.
