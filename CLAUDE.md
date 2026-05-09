# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

Static personal portfolio/blog for Eduardo Toledo (etechoptimist), hosted on GitHub Pages. No build step — all files are served directly. Jekyll is configured only for metadata/SEO (`_config.yml`) but no Jekyll theme is used (`.nojekyll` disables processing).

## Local preview

```powershell
# Python (usually available)
python -m http.server 8080

# Node (if installed)
npx serve .
```

Open `http://localhost:8080`. There is no build, lint, or test pipeline.

## Architecture

### Single-page partial injection pattern

`index.html` is the single entry point. It contains placeholder `<div>` elements that `assets/js/main.js` fills at runtime via `fetch()`:

| Placeholder div `id` | Partial file |
|---|---|
| `home-container` | `partials/home.html` |
| `education-container` | `partials/education.html` |
| `certifications-container` | `partials/certifications.html` |
| `project-health-intelligence-container` | `partials/project-health-intelligence.html` |
| `project-knowbot-container` | `partials/project-knowbot.html` |
| `project-financial-coaching-container` | `partials/project-financial-coaching.html` |
| `articles-list` | `partials/articles-inner.html` + Medium RSS via `api.rss2json.com` |

The boot sequence in `main.js` runs these injections in order. After injection, Mermaid diagrams inside partials are re-initialized with `mermaid.init(undefined, container.querySelectorAll(".mermaid"))`.

### Adding a new section

1. Add a placeholder `<div id="project-foo-container">` in `index.html` inside the appropriate `<section>`.
2. Create `partials/project-foo.html` with the content.
3. Add an `injectFooProject()` async function in `main.js` following the existing pattern.
4. Call it in the boot `(async () => { ... })()` block.
5. If the partial contains Mermaid diagrams, call `mermaid.init` after injection.

### CSS design tokens

All visual constants are CSS custom properties in `assets/css/styles.css` (`:root` block):

- `--brand: #0070f3` — primary blue
- `--max-content: 800px` — body text column width
- `--max-wide: 1100px` — wide layout breakpoint
- `--nav-height-offset: 90px` — used on `[id]` for scroll-margin-top

### SEO intent

LinkedIn (`linkedin.com/in/etechoptimist`) is the primary identity. This site is explicitly a blog/portfolio, not a personal homepage. Schema.org markup, Open Graph, and `<meta>` tags reflect this. Do not add markup that would make this site appear as the primary identity endpoint.

## notes/ directory

The `notes/` folder contains planning and requirements documents for a separate AWS/LangGraph backend project (Health Record Intelligence Platform) that Eduardo is building. These files are not part of the portfolio site itself — they are working documents for the platform project.
