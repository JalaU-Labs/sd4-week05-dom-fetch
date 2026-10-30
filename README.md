# sd4-week05-dom-fetch

Laboratory activity for Week 05 - Software Development IV (Jala University).

Web application that consumes the DummyJSON public API to display a list of products. Implements DOM manipulation, the Fetch API, closures, and Promises in vanilla JavaScript (ES Modules), styled with Tailwind CSS.

## Stack

- HTML5, CSS3, JavaScript (ES Modules)
- Tailwind CSS (CLI build)
- Vite (development server and production build)
- Vitest + jsdom (unit tests)
- Playwright (end-to-end tests)
- ESLint + Prettier
- TypeScript type checking via `tsc --checkJs` with JSDoc annotations
- Docker and Docker Compose (dev and prod profiles)
- GitHub Actions and GitLab CI

## Deployed sites

- GitHub Pages: https://jalau-labs.github.io/sd4-week05-dom-fetch/
- GitLab Pages: https://sd4-week05-dom-fetch-28261b.gitlab.io/

## Documentation

- Technical documentation and network evidence: [docs/documentation.pdf](docs/documentation.pdf)
- Markdown source: [docs/documentation.md](docs/documentation.md)
- Browser DevTools screenshots: [docs/images/](docs/images/)

## Repository

- Primary (fetch): GitLab
- Mirror (push): GitHub

## Local development

```bash
pnpm install
pnpm run dev
```

## Quality gate

```bash
pnpm run verify
pnpm run test:e2e
```

## Containers

```bash
make docker-up-prod   # serves the production bundle on http://localhost:8080
make docker-up-dev    # starts the dev server on http://localhost:5173
make docker-down
```

## Regenerating the PDF

```bash
make docs
```

Requires `pandoc` and a LaTeX engine (`texlive-xetex` on Arch Linux).

## License

MIT - Diego Alejandro Botina, 2026.
