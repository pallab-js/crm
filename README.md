# OpenCRM

A free, open-source CRM desktop application for macOS Apple Silicon, built with Tauri v2 + Next.js 16.

## Features

- **Dashboard** — Real-time overview of your sales pipeline
- **Contacts** — Manage customers with tags, notes, and email tracking
- **Companies** — Track company profiles and associations
- **Deals** — Kanban board with probability-based deal tracking
- **Tasks** — Todo management with recurring task support
- **Calendar** — Monthly calendar view for scheduling
- **Analytics** — Visual charts and performance metrics
- **Command Palette** — Global search and quick actions (Cmd+K)
- **Activity Timeline** — Chronological view of all customer interactions
- **Kanban Boards** — Drag-and-drop management for deals and tasks

## Getting Started

### Prerequisites

- macOS Apple Silicon (M1/M2/M3)
- Node.js 20+
- Rust toolchain
- pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/pallab-js/crm.git
cd crm

# Install dependencies
pnpm install

# Run in development mode
pnpm tauri dev

# Build for production
pnpm tauri build --target aarch64-apple-darwin
```

### Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Run Next.js dev server |
| `pnpm tauri dev` | Run Tauri in dev mode |
| `pnpm build` | Production build (static export) |
| `pnpm tauri build` | Build Tauri app |
| `pnpm test` | Run tests (vitest) |
| `pnpm test:run` | Run tests once (CI mode) |
| `pnpm lint` | Run linting |

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `1` | Dashboard |
| `2` | Contacts |
| `3` | Companies |
| `4` | Deals |
| `5` | Tasks |
| `6` | Calendar |
| `7` | Analytics |
| `Cmd+K` | Command Palette |

## Project Structure

```
crm/
├── app/
│   ├── globals.css          # CSS variables & global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main app shell (routing + dashboard)
├── components/
│   ├── dashboard/           # Dashboard widgets (StatCard, Charts, Kanban, etc.)
│   ├── features/            # Feature sub-components per domain
│   │   ├── contacts/
│   │   ├── companies/
│   │   ├── deals/
│   │   ├── tasks/
│   │   └── analytics/
│   ├── pages/               # Full-page views (ContactsPage, DealsPage, etc.)
│   └── ui/                  # Shared primitives (Button, Card, Badge, ErrorBoundary, etc.)
├── lib/
│   ├── constants.ts         # Shared enums and formatters
│   ├── ipc.ts               # TypeScript interfaces + Tauri invoke wrappers
│   ├── useDebounce.ts       # Debounce hook
│   ├── utils.ts             # cn() and other utilities
│   └── validation.ts        # Pure validation functions
├── services/
│   ├── dataService.ts       # Wraps Tauri IPC with error handling
│   ├── exportService.ts     # CSV/JSON export logic
│   └── importService.ts     # CSV/JSON import with validation
├── store/
│   ├── contactsStore.ts
│   ├── companiesStore.ts
│   ├── dealsStore.ts
│   ├── tasksStore.ts
│   ├── uiStore.ts
│   ├── activityStore.ts
│   └── dashboard.ts         # useAppStore facade (backward-compatible)
└── src-tauri/
    ├── src/
    │   ├── lib.rs           # Tauri commands (load_app_data, save_app_data)
    │   └── main.rs
    └── capabilities/
        └── default.json     # Tauri v2 capability permissions
```

## Tech Stack

- **Frontend**: Next.js 16, React 19, TailwindCSS v4
- **Backend**: Rust, Tauri v2
- **State**: Zustand 5
- **Charts**: Recharts
- **Persistence**: Rust IPC (`load_app_data` / `save_app_data`) writing to `data.json` in the app data directory
- **Testing**: Vitest + React Testing Library

## Design

OpenCRM uses a Supabase-inspired dark-mode design system. See [DESIGN.md](./DESIGN.md) for the complete design reference.

## License

MIT License ([LICENSE-MIT](./LICENSE-MIT))

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## Code of Conduct

Please read our [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) to keep our community approachable and respectable.
