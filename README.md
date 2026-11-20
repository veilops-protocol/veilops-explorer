<p align="center"><a href="https://veilops.tech"><img src="https://raw.githubusercontent.com/veilops-protocol/veilops/main/docs/assets/banner.png" alt="VEILOPS: Privacy is not the absence of proof. It's proof without exposure." width="100%"></a></p>

# veilops-explorer

Web front end for browsing and verifying VEILOPS public records, part of the veilops.tech site.

> **Status: in development.** It currently displays a **sample** dataset: every record is flagged `sample: true` and signed by a throwaway sample key. It does not index any blockchain and there is no deployment that reads live data. A standalone explorer is planned for Phase 04.

**Mirror of** [`veilops-protocol/veilops`](https://github.com/veilops-protocol/veilops) → `apps/website/` (see [MIRROR.md](MIRROR.md)). The explorer lives inside the website app during Phase 01. File issues and pull requests on the monorepo.

## Stack

Next.js 16 (App Router), Tailwind CSS, Framer Motion. The app depends on the same workspace packages as the SDK (`@veilops/proof-engine`, `@veilops/sdk`, …), so record verification uses the same code.

## Run locally

The app depends on the workspace packages, so it does not build from this mirror alone. Use the monorepo:

```bash
git clone https://github.com/veilops-protocol/veilops.git
cd veilops && npm ci
npm run samples   # regenerate the sample dataset (optional)
npm run dev       # http://localhost:3700
```

Environment variables are documented in the monorepo's `.env.example` (`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_GITHUB_ORG`, `NEXT_PUBLIC_GITHUB_PUBLISHED`).

License: Apache-2.0.
