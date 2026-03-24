# Canton Scan Dashboard

## Overview
Real-time analytics dashboard for the Canton Network. Displays network stats, tokenomics, architecture explainer, app reward calculator, and grant program information.

## Stack
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS v4
- **Charts:** Recharts
- **Icons:** Lucide React
- **Package manager:** bun
- **Linter:** Biome

## Structure
```
src/
  app/           # Next.js pages and API routes
    api/         # Server-side API proxy to Canton Scan API
  components/    # React components (stat cards, charts, calculators)
  lib/           # Canton API client and utilities
  types/         # TypeScript type definitions
```

## Dev Commands
```bash
bun install          # Install dependencies
bun run dev          # Start dev server (port 3000)
bun run build        # Production build
bun run lint         # Biome lint + format
bun run type-check   # TypeScript check
```

## Environment
Copy `.env.example` to `.env.local` and configure the Scan API endpoint.

## Key APIs
- Canton Scan API: `/v2/updates`, `/v0/state/open-mining-rounds`, `/v0/state/closed-mining-rounds`
- App reward calculation: 62% of 516M CC monthly pool distributed by transaction share
