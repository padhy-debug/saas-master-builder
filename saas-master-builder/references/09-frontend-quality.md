# Frontend Quality — Avoiding the Generic "AI-Made" Look

If this environment has a `frontend-design` skill available, read it alongside this file for the actual design-token, typography, and layout guidance — it covers the visual craft in depth. This file covers the SaaS-specific patterns that make a product look templated versus intentional.

## What makes a SaaS UI look generic/AI-generated

- The same purple-to-blue gradient hero section every template defaults to.
- Three identical rounded cards in a row, each with a circular icon badge and centered text — the single most recognizable "AI landing page" pattern.
- Every piece of text at the same font weight and similar size — no real typographic hierarchy.
- Stock icon-in-a-circle illustrations instead of real product screenshots.
- Placeholder/lorem-ipsum-adjacent copy that never got replaced with real product language.
- Uniform 16px border-radius and identical shadow on every single element, regardless of whether it's a card, a button, or a modal.
- No distinct empty/loading/error states — every screen assumes the happy path with data already present.

## What to do instead

- Establish a real type scale (a handful of deliberate sizes/weights, not "big," "medium," "small" applied inconsistently) and a spacing system (a consistent step scale, e.g. 4/8/12/16/24/32px) — consistency reads as intentional, arbitrary spacing reads as generated.
- Use actual product screenshots or realistic mockups in marketing/onboarding surfaces, not generic stock illustrations.
- Vary visual weight deliberately: not every surface needs a border, a shadow, and rounded corners — flat, bordered, and elevated surfaces used purposefully read as designed; used uniformly everywhere, they read as default.
- Design (not skip) the states that aren't the happy path: empty states (what does a brand-new tenant see with zero data?), loading states, error states, and permission-denied states. These are usually a large fraction of what real users actually see day to day.
- Implement dark mode as a real second design pass (checking contrast and adjusted colors), not just inverting the light-mode palette.
- Accessibility basics as a baseline, not an afterthought: sufficient color contrast, visible focus states for keyboard navigation, semantic HTML/ARIA labeling on interactive elements — this also happens to overlap with GIGW/accessibility requirements for any government-facing product (file 06).

## Screens a real SaaS product needs that templates usually skip

- A genuinely useful onboarding/empty-state flow, not just a dashboard that's blank until data exists.
- Billing/plan management screen (current plan, usage against limits, upgrade/downgrade, invoice history).
- Usage/quota dashboard if the product has any metered limits — users should never be surprised by hitting a limit they couldn't see coming.
- Team/member management with clear role indicators.
- A notification center/inbox, not just toast messages that disappear.
- An in-app changelog or "what's new," especially useful for enterprise buyers evaluating active development.
- Properly themed 404/500/maintenance pages that match the product's actual design system, not the framework's default error page.

## The test to apply before calling a screen "done"

Would a designer who's seen a hundred SaaS products immediately recognize this as a default template, or does it feel like someone made deliberate choices for this specific product? If every choice (colors, spacing, icon style, copy) could be swapped into a completely different product with zero changes, the design hasn't actually happened yet — only the layout has.
