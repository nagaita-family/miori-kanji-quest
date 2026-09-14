# Deployment notes

## Primary hosting

Miori Kanji Quest is moving to **GitHub Pages**.

Expected Pages URL:

`https://nagaitashouten-star.github.io/miori-kanji-quest/`

Publish source:

- branch: `main`
- folder: `/ (root)`

All production assets use relative paths (`./...`) so the project works under the `/miori-kanji-quest/` GitHub Pages subpath.

## Legacy Netlify

The old Netlify project is intentionally kept for reference:

`https://miori-kanji-quest.netlify.app`

Snapshots:

- `archive/netlify-production-v2.0.2` = last version that actually reached Netlify Production before the credit limit stopped deploys
- `archive/netlify-era-v2.0.3` = latest source at the end of the Netlify-centered workflow

The Netlify URL may be older than `main` and should not be treated as the current app after the Pages migration.

## One-time GitHub Pages setup

In repository Settings → Pages:

1. Build and deployment → Source: `Deploy from a branch`
2. Branch: `main`
3. Folder: `/ (root)`
4. Save

After that, pushes to `main` are automatically published to the Pages URL.

## Important app data note

Learning progress is currently stored in browser `localStorage`. Do not clear site data casually. The GitHub Pages origin is different from the old Netlify origin, so existing Netlify progress does not automatically appear on GitHub Pages.
