# Tori — Systems & Backend Engineering Portfolio

A high-performance, client-side personal developer portfolio for **Tori** (`revamptori`), designed with Swiss editorial aesthetics, restrained brutalism, and technical documentation precision.

Engineered as a zero-backend, pure JavaScript / TypeScript static application ready for immediate public deployment on **GitHub Pages**, Vercel, Netlify, Cloudflare Pages, or any static CDN.

---

## Architectural Highlights

- **Zero-Backend Architecture**: 100% static client build running in any modern browser without requiring a persistent Python, Node, or Rust server runtime.
- **Automated GitHub Pages Deployment**: Fully configured GitHub Actions workflow (`.github/workflows/deploy.yml`) that runs tests, builds assets with Vite, and publishes to GitHub Pages on every push to `main`.
- **Live GitHub REST API Synchronization**: Synchronizes Tori's public repositories (`flap`, `HttpR`, `RMTP`, `gaspscan`, `Falo`) and developer profile directly from GitHub's public API with client-side caching.
- **Verified GitHub Contribution Calendar**: Pre-rendered, verified contribution calendar for 2026 (67 contributions) with intensity quartiles, month/weekday labels, and interactive hover tooltips.
- **Curated Systems Projects**: Detailed specifications, architecture data-flow diagrams, and technical decisions for `flap` (Rust web framework), `HttpR` (async HTTP client), `RMTP` (RFC 5321 SMTP daemon), `ToriUtilities`, and the experimental Rust-native game engine.
- **Interactive Performance Benchmarks**: Direct telemetry and interactive charts for Requests Per Second (RPS), p95 latency, and memory footprint from `revamptori/flap` release benchmarks (comparing Flask 3.1 vs flap Python fallback vs flap Rust core).
- **Technical Documentation & Essays**: In-depth architectural writeups on eliminating WSGI bottlenecks, PyO3 FFI memory safety, and writing async protocol daemons in safe Rust.

---

## Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Language** | **TypeScript 5.6** | Strict type safety, clean data interfaces |
| **Framework** | **React 18** | Functional components and hooks |
| **Build Setup** | **Vite 5** | Lightning-fast HMR and optimized production bundling |
| **Styling** | **Custom Swiss CSS** | Near-black (`#09090b`), off-white typography, 1px hairlines, Swiss vermilion accent (`#ff4500`) |
| **Typography** | **Inter & IBM Plex Mono** | Typographic hierarchy, monospaced metadata keys |
| **Test Runner** | **Vitest** | Automated client and API unit testing |
| **Deployment** | **GitHub Actions** | Automated CI/CD deployment to GitHub Pages (`.github/workflows/deploy.yml`) |

---

## Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open `http://localhost:8000` (or `http://localhost:5173`) in your browser.

### 3. Run Automated Tests
```bash
npm run test
```

### 4. Build for Production
```bash
npm run build
```
The compiled, production-optimized static files will be placed in the `dist/` directory.

### 5. Local Production Preview
```bash
npm run preview
```

---

## Deploying to a Public GitHub Repository

### Option 1: Automated GitHub Pages (Recommended)
This repository includes `.github/workflows/deploy.yml`:
1. Push this repository to your GitHub account (`https://github.com/revamptori/tori`).
2. Go to your repository on GitHub: **Settings** → **Pages**.
3. Under **Build and deployment** → **Source**, select **GitHub Actions**.
4. Every push to `main` will automatically build and publish your portfolio to `https://revamptori.github.io/tori/` (or your custom domain).

### Option 2: Deploy to Vercel / Netlify / Cloudflare Pages
1. Import your GitHub repository into Vercel, Netlify, or Cloudflare Pages.
2. Build settings are auto-detected:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

---

## Project Structure

```text
├── .github/
│   └── workflows/
│       └── deploy.yml        # GitHub Actions workflow for GitHub Pages
├── public/
│   └── favicon.svg           # Custom Swiss minimalist vector favicon
├── src/
│   ├── components/           # UI components
│   │   ├── ArchitectureDiagram.tsx
│   │   ├── BenchmarkChart.tsx
│   │   ├── ContributionGraph.tsx
│   │   ├── Footer.tsx
│   │   ├── Navbar.tsx
│   │   └── ProjectCard.tsx
│   ├── data/                 # Bundled static data modules
│   │   ├── articles.ts       # Technical engineering essays & diagrams
│   │   ├── benchmarks.ts     # Verified flap release benchmark datasets
│   │   ├── contributions.ts  # Verified contribution calendar snapshots
│   │   └── projects.ts       # Curated systems projects & architecture specs
│   ├── pages/                # Page views
│   │   ├── AboutPage.tsx
│   │   ├── BenchmarksPage.tsx
│   │   ├── ContactPage.tsx
│   │   ├── EngineeringPage.tsx
│   │   ├── GitHubPage.tsx
│   │   ├── HomePage.tsx
│   │   ├── NotFoundPage.tsx
│   │   └── ProjectDetailPage.tsx
│   ├── tests/                # Automated tests
│   │   └── api.test.ts
│   ├── api.ts                # Client-side data client with GitHub REST sync
│   ├── App.tsx               # Main application container & routing
│   ├── index.css             # Monochromatic Swiss design system
│   ├── main.tsx              # React DOM entry point
│   └── types.ts              # TypeScript definitions
├── index.html                # Semantic HTML5 template with SEO metadata
├── package.json              # Project scripts & dependencies
├── tsconfig.json             # TypeScript configuration
└── vite.config.ts            # Vite bundler configuration (base: './')
```

---

## License

MIT © Tori (`revamptori`).
