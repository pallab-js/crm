# Contributing to OpenCRM

Thank you for your interest in contributing to OpenCRM!

## How to Contribute

### Reporting Bugs

1. Search existing issues to avoid duplicates
2. Use the bug report template
3. Include steps to reproduce, expected behavior, and actual behavior
4. Attach screenshots if applicable

### Suggesting Features

1. Search existing feature requests
2. Use the feature request template
3. Explain the use case and expected behavior
4. Consider alternative solutions

### Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes following the code style
4. Add tests if applicable
5. Ensure all tests pass
6. Commit with a clear message
7. Push to your fork
8. Submit a pull request

## Development Setup

```bash
# Clone and install
git clone https://github.com/yourusername/opencrm.git
cd opencrm
pnpm install

# Run development server
pnpm tauri dev
```

## Code Style

- Follow existing patterns in the codebase
- Use TypeScript for frontend code
- Use Rust for backend code
- Run `pnpm lint` before committing

## AI Agent Guidelines

This project uses AI agents to assist with development. When working on this codebase, follow these guidelines:

### Design System

- Use Supabase-inspired dark theme (see DESIGN.md)
- Colors: `#0f0f0f` (button bg), `#171717` (page bg), `#3ecf8e` (brand green)
- Typography: Circular (primary), Source Code Pro (mono)
- No box-shadows; use border hierarchy for depth

### Phase-Based Development

Follow the phase order from BLUEPRINT.md:
1. Scaffold + Config
2. Design Tokens
3. Rust IPC + Data Contracts
4. State Layer (Zustand)
5. Dashboard UI
6. Build + Package
7. Open-Source + CI/CD

### Validation Gates

Each phase has validation gates. See BLUEPRINT.md for pass criteria.

### Key Rules

- Always use Tauri v2 APIs (not v1)
- Use Next.js 14 App Router
- Use Zustand for state management
- Use TailwindCSS with design tokens
- Use Recharts for charts (SVG-first)
- Target macOS Apple Silicon (aarch64-apple-darwin)

## Recognition

Contributors will be listed in the README and release notes.

## Questions?

Open an issue for questions about contributing.
