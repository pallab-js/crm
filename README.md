# OpenCRM

A free, open-source CRM desktop application for macOS Apple Silicon, built with Tauri v2 + Next.js 14.

## Features

- **Dashboard** — Real-time overview of your sales pipeline
- **Contacts** — Manage customers with tags, notes, and email tracking
- **Companies** — Track company profiles and associations
- **Deals** — Kanban board with probability-based deal tracking
- **Tasks** — Todo management with recurring task support
- **Calendar** — Monthly calendar view for scheduling
- **Analytics** — Visual charts and performance metrics

## Getting Started

### Prerequisites

- macOS Apple Silicon (M1/M2/M3)
- Node.js 20+
- Rust toolchain
- pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/opencrm.git
cd opencrm

# Install dependencies
pnpm install

# Run in development mode
pnpm tauri dev

# Build for production
pnpm tauri build --target aarch64-apple-darwin
```

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| 1 | Dashboard |
| 2 | Contacts |
| 3 | Companies |
| 4 | Deals |
| 5 | Tasks |
| 6 | Calendar |
| 7 | Analytics |

## Tech Stack

- **Frontend**: Next.js 14, React, TailwindCSS
- **Backend**: Rust, Tauri v2
- **State**: Zustand
- **Charts**: Recharts
- **Persistence**: @tauri-apps/plugin-fs

## Design

OpenCRM uses a Supabase-inspired dark-mode design system. See [DESIGN.md](./DESIGN.md) for the complete design reference.

## License

Licensed under either of:
- Apache License, Version 2.0 ([LICENSE-APACHE](./LICENSE-APACHE))
- MIT license ([LICENSE-MIT](./LICENSE-MIT))

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## Code of Conduct

Please read our [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) to keep our community approachable and respectable.
