# Canton Scan Dashboard

Real-time analytics dashboard for the **Canton Network** — the institutional-grade Layer 1 blockchain for tokenized finance.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

- **Network Overview** — Live stats: transactions, CC price, supply, burn rate, validator count
- **Tokenomics Visualizer** — 10-year emission projection, reward distribution breakdown (burn-mint equilibrium)
- **Architecture Explorer** — Interactive guide to Canton's 3-node architecture (Participant, Sequencer, Mediator)
- **App Reward Calculator** — Estimate monthly CC earnings as a Featured App based on transaction volume
- **Grant Program Guide** — Canton Foundation grants: focus areas, application process, eligibility
- **Transaction Feed** — Real-time transaction stream from the Canton Scan API

## Why This Matters

Canton Network distributes **62% of all CC emissions** (~516M CC/month) to application builders. This dashboard helps developers and builders:

1. **Understand the opportunity** — Calculate potential earnings before building
2. **Monitor network health** — Track real-time metrics and tokenomics
3. **Learn the architecture** — Interactive explainer of Canton's privacy-preserving design
4. **Apply for grants** — Step-by-step guide to the Canton Foundation Grants Program

## Quick Start

```bash
# Clone
git clone https://github.com/alexandre-mrt/canton-scan-dashboard.git
cd canton-scan-dashboard

# Install
bun install

# Configure
cp .env.example .env.local

# Run
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_SCAN_API_URL` | Canton Scan API endpoint | `https://scan.sv-2.canton.network/api/scan` |
| `NEXT_PUBLIC_CANTON_NODES_API` | Canton Nodes RPC API | `https://api.cantonnodes.com` |

## Tech Stack

- **Next.js 15** — App Router, Server Components, API Routes
- **TypeScript** — Strict mode
- **Tailwind CSS v4** — Utility-first styling
- **Recharts** — Charts and data visualization
- **Lucide React** — Icons

## Canton Network Key Metrics

| Metric | Value |
|--------|-------|
| Monthly Transactions | 15M+ |
| Daily Ledger Events | 3M+ |
| Super Validators | 13 (Goldman Sachs, Broadridge, DTCC...) |
| Canton Coin Price | ~$0.15 |
| Circulating Supply | ~22B CC |
| App Reward Pool | 516M CC/month (62% of emissions) |
| Tokenized Assets | $6T+ represented |

## Grant Eligibility

This project is designed as a **public good** for the Canton ecosystem and is eligible for the [Canton Foundation Grants Program](https://canton.foundation/grants-program/):

- **Category:** Developer Tools / Network Analytics
- **Focus:** Transparency, developer onboarding, ecosystem monitoring
- **How to apply:** Submit a PR to [canton-foundation/canton-dev-fund](https://github.com/canton-foundation/canton-dev-fund)

## Deploy

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/alexandre-mrt/canton-scan-dashboard)

### Docker

```bash
docker build -t canton-scan-dashboard .
docker run -p 3000:3000 canton-scan-dashboard
```

## Contributing

PRs welcome! See [CLAUDE.md](CLAUDE.md) for development conventions.

## License

MIT

---

Built for the Canton ecosystem. Not affiliated with Digital Asset.
