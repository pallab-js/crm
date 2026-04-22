# OpenCRM Agent Guide

## Project
Tauri 2 desktop app. Frontend: Next.js 16 (static export), React 19, Zustand 5, Tailwind 4.
Backend: Rust (Tauri commands) reading/writing a single `data.json` via `load_app_data` / `save_app_data`.

## Key Constraints
- `next build` must produce static output (`output: 'export'`) — no server-side code.
- All data mutations go through `store/dashboard.ts` → `saveAppData()` (IPC to Rust).
- Do NOT use `localStorage` or `sessionStorage`.
- TypeScript strict mode is on. No `any`.
- Design system: dark-mode-native, CSS vars in `app/globals.css`. See `DESIGN.md`.

## Commands
- Dev: `pnpm tauri dev`
- Test: `pnpm test:run`
- Build: `pnpm tauri build`
- Lint: `pnpm lint`

## File Map
- `app/globals.css` — CSS variables & global styles
- `lib/ipc.ts` — TypeScript interfaces + Tauri invoke wrappers
- `lib/constants.ts` — shared enums, formatters
- `lib/validation.ts` — pure validation functions
- `store/dashboard.ts` — Zustand store (single source of truth)
- `components/ui/` — shared primitives (Button, Card, Badge, etc.)
- `components/pages/` — full-page views
- `components/dashboard/` — Dashboard-specific widgets
- `src-tauri/src/lib.rs` — Rust commands