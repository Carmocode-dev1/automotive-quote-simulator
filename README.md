# Automotive Quote & Financing Simulator

Interactive web application demonstrating multi-brand commercial quote generation, external photo lookup fallback states, guarded financing calculations, and A4 print-ready PDF output.

Live demo: https://Carmocode-dev1.github.io/automotive-quote-simulator/

## What This Demonstrates

- **Multi-brand theme & routing:** Switches between two distinct commercial sheet layouts while keeping identical financial rules.
- **Guarded financing engine (`src/finance.js`):**
  - Enforces `financedCapital = max(0, salePrice - discount + warranty - downPayment)` so missing or low price fields never produce negative financed amounts.
  - Calculates monthly installments for 60, 72, 84, 96, 108, and 120 months using TIN (%) and opening fee (%).
  - Formats figures cleanly in European currency notation.
- **Resilient inventory lookup simulation:** Lets you toggle `Cached Hit`, `Catalog API Hit`, `Missing / 404`, and `Timeout / 503` modes to verify that quote generation and PDF export never block when external media fails.
- **Zero-dependency ES modules:** Runs directly in any modern browser or static host, with automated Node unit tests running in CI.

## Project Layout

```
index.html              Main UI and A4 print-ready quote sheet
styles.css              Responsive layout + @media print stylesheet
src/catalog.js          Sample multi-brand inventory dataset and SVG vehicle previews
src/finance.js          Pure financing and amortization calculation module
src/app.js              DOM state management, filtering, and simulated lookup states
tests/finance.test.mjs  Unit tests using node:test and node:assert/strict
```

## Running Tests Locally

Requires Node.js 20+:

```bash
npm test
```
