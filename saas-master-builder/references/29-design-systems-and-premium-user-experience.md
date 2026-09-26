# 29: SaaS Design Systems and Premium User Experience

> Standards for building Linear/Vercel-grade user experiences, cohesive design tokens, micro-interactions, accessibility (WCAG AA), and high-converting state machines.

---

## 1. Aesthetic Hierarchy and SaaS Polish

A SaaS product's visual polish directly impacts user trust, retention, and pricing power:
1. **Curated Neutrals**: Replace raw grays (`#808080`) with tinted slate/zinc neutrals (`#09090b`, `#18181b`, `#27272a`, `#f4f4f5`).
2. **Predictable Elevation**: Rely on subtle 1px border contrast (`var(--border-subtle)`) and refined layered shadows rather than heavy drop shadows.
3. **Typography Rhythm**: Pair a high-clarity sans-serif (Inter, Geist, Roboto) with a monospace font for financial and technical data (JetBrains Mono).

---

## 2. The Four Mandatory UI States

Every interactive view or component in a production SaaS must handle all four canonical states:
1. **Empty State**: Guide the user forward with a clear illustration, explanatory description, and primary CTA.
2. **Loading State**: Use structural skeleton loaders matching content layout rather than blocking full-screen spinners.
3. **Error Boundary State**: Gracefully catch rendering errors, provide an incident reference ID, and offer a "Try Again" action without crashing the entire app.
4. **Paywall / Upsell State**: Display when a tenant hits an entitlement boundary, showcasing value propositions and an instant upgrade path.

---

## 3. Keyboard Navigation & Accessibility (WCAG 2.1 AA)

- All interactive controls must provide visible, high-contrast focus rings (`:focus-visible`).
- Data tables must support keyboard arrow navigation and `aria-sort` attributes.
- Modal dialogs must trap focus, close on `Escape`, and restore focus to the triggering element upon exit.

---

## 4. Production Checklist

- [ ] Dark and light themes defined via centralized CSS custom properties.
- [ ] No hardcoded hex codes inside component files.
- [ ] Skeleton loaders match exact dimensions of loaded UI elements to eliminate Cumulative Layout Shift (CLS < 0.1).
- [ ] Paywall modals clearly communicate tier benefits and trigger frictionless Stripe checkout sessions.
