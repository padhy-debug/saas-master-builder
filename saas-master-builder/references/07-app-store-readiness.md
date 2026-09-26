# App Store Readiness — Getting Approved in One Shot

Goal: submit once, get approved once. Most rejections are self-inflicted and avoidable with a real pre-submission checklist — they're rarely about the app being "not good enough," they're about mismatches between what the app claims and what it does.

**This file is dated.** Store policies change often. Before a real submission, re-check the current Google Play Console policy center and Apple App Store Review Guidelines — treat the checklist below as a strong starting point, not the final word.

## Realistic timelines (so you can plan a launch date, researched as of 2026)

| Scenario | Typical review time |
|---|---|
| New app, clean submission | 24–72 hours |
| New app with subscription billing or DRM | 3–7 days |
| Complex third-party SDK integrations or sensitive content | 7–14 days |
| Resubmission after a rejection | +3–7 days on top |

Build at least a three-week buffer into any launch plan: roughly two weeks for closed/internal testing, plus a week for the first review cycle — and don't announce a hard launch date publicly until the app is actually live.

## Why apps really get rejected (the recurring patterns)

- **Metadata/functionality mismatch.** Screenshots, description, or title promise something the submitted build doesn't actually do, or shows a feature that isn't reachable in the version submitted. Reviewers (increasingly AI-assisted on Google's side) check this closely — every claim in the listing has to map to a real, reachable screen in the exact build submitted.
- **Permissions without justification.** Every requested device permission (camera, location, contacts, storage, etc.) must be clearly tied to a real, visible feature and requested using the least invasive option available. An unused or unexplained permission is one of the most common flags.
- **Data Safety / App Privacy form doesn't match reality.** This is a major and growing rejection cause: the declared data-collection form must match what the app *and every third-party SDK inside it* (ad networks, analytics, crash reporting) actually collects — not just what your own code collects. Audit your SDKs' data practices, don't just describe your own.
- **Missing or inaccessible Privacy Policy.** Required the moment the app collects any user data, must be reachable without logging in first.
- **Copyright/trademark/impersonation.** Using someone else's name, logo, or brand assets without authorization, or an app name/icon that could be confused with an existing app.
- **Incomplete builds / crashes / placeholder content.** Dead links, "Lorem ipsum," disabled buttons, or a crash during a normal first-use flow. A review pass on your own dev device is not a substitute for testing the actual real user journey end to end.
- **Digital goods routed around platform billing.** In-app purchases of digital content/subscriptions generally must go through the platform's own billing (Play Billing / StoreKit) rather than an external payment link — a very common and strictly enforced rejection cause for subscription SaaS mobile apps.
- **Excessive or intrusive ads**, or ads that interrupt core functionality.
- **Duplicate/low-value app** — a near-identical resubmission of a previously removed app, or an app that's functionally just a website wrapped with no native value, can be rejected for lacking differentiation.

## One-shot approval checklist

- [ ] Build is feature-complete for what's described/shown in the listing — no dead links, disabled buttons, or placeholder text
- [ ] Every requested permission maps 1:1 to a visible, explained feature; remove anything unused
- [ ] Data Safety (Play) / App Privacy (Apple) form audited against **actual** data collection, including every third-party SDK — not filled from memory
- [ ] Privacy Policy is live, accurate, and reachable without login
- [ ] Screenshots and preview video show real in-app screens from the actual submitted build
- [ ] App name/icon doesn't resemble or impersonate an existing brand; written brand authorization on file if using a client's trademark
- [ ] Targets the current required Android API level / current iOS SDK (both platforms require staying within a rolling window of the latest release)
- [ ] Subscriptions/digital goods purchased through Play Billing / StoreKit, not external checkout links
- [ ] Account deletion is available inside the app if account creation is offered (both major stores require this)
- [ ] Tested on real devices across a few OS versions — not just an emulator or a single dev phone
- [ ] Content rating questionnaire completed accurately for the actual content
- [ ] Ran a closed/internal testing track first (recommend ~2 weeks) to catch issues before the public submission
- [ ] Developer account identity verification completed where the target stores require it (developer verification requirements have been expanding across regions through 2026 — check current status for your target markets)
- [ ] Used the platform's own pre-submission policy-check tooling where available (e.g. Play Policy Insights in Android Studio) to catch likely flags before submitting

## Practical process recommendation

1. Internal QA pass against this checklist.
2. Closed/internal testing track (real users, real devices) for ~2 weeks.
3. Fix everything the testers actually hit — don't rationalize it away as "edge case."
4. Re-audit the Data Safety/Privacy form one more time right before submitting — this is the item that shifts most often as features/SDKs change during development.
5. Submit with a launch date buffer, never a same-day public announcement.
