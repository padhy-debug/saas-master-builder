# Internationalization (i18n), Currencies & Timezone Architecture

Building a global SaaS requires absolute discipline regarding timestamps, currencies, and localized strings. A single floating-point rounding error in billing or an ambiguous date format (`03/04/2026`: March 4 or April 3?) can corrupt financial ledgers and destroy user trust.

---

## 1. The Three Inviolable Laws of Time

1. **Law 1: All Server Timestamps are UTC**: The database column must ALWAYS be `TIMESTAMPTZ` (Timestamp with Time Zone), and server clocks must run in UTC. Never store localized local wall-clock times in database tables.
2. **Law 2: Conversion Occurs Only at the Edge**: Format timestamps into the user's localized timezone (e.g. `Asia/Kolkata`, `America/New_York`) only when rendering UI in the frontend or compiling localized PDF reports.
3. **Law 3: Ambiguous Date Strings are Banned**: Never pass dates like `"05/06/2026"`. All API payloads must use ISO 8601 extended format: `2026-09-26T18:30:00.000Z`.

---

## 2. The Integer Currency Standard (No Floating Point Math)

In JavaScript and Python, `0.1 + 0.2 = 0.30000000000000004`. If you calculate customer invoices or account balances using floating-point `FLOAT` or `DOUBLE` columns, your billing will eventually drift by cents and fail financial audits.

### The Standard:
1. **Store in Minor Units (Integers)**:
   - USD `$10.50` -> `1050` cents (BIGINT).
   - EUR `€25.00` -> `2500` cents (BIGINT).
   - JPY `¥1000` -> `1000` yen (Zero-decimal currency).
2. **Format using `Intl.NumberFormat`**:
   ```ts
   export function formatCurrency(amountCents: number, currency: string = 'USD', locale: string = 'en-US'): string {
     return new Intl.NumberFormat(locale, {
       style: 'currency',
       currency: currency,
     }).format(amountCents / 100);
   }
   ```

---

## 3. Localization (i18n) & Right-to-Left (RTL) Layouts

- **No Hardcoded Strings**: All UI text must reference dictionary keys (e.g. `t('billing.upgrade_plan')`).
- **ICU Pluralization**: Use standard plural formats (`{count, plural, one {# item} other {# items}}`) instead of appending an `"s"`, which breaks in Slavic, Romance, and Asian languages.
- **RTL Support**: Use CSS Logical Properties (`margin-inline-start`, `padding-inline-end`) instead of `margin-left` and `padding-right` so layouts flip automatically when switching to Arabic or Hebrew.
