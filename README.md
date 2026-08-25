# Kaushalya Nagahawatte

Personal site. Content lives in Markdown so the writing can change without touching the layout.

## From her Windows laptop

She does **not** need Fly, Docker, or the terminal. After this repo is on GitHub and Fly is connected once:

1. Log in to GitHub as Kaushalya.
2. Open `content/`, edit a Markdown file with the pencil icon.
3. Click **Commit changes**.
4. Wait a few minutes; GitHub Actions deploys to Fly.io.

Details are in `content/HOW-TO-EDIT.md`.

One-time setup (on a machine logged into her Fly account):

```bash
fly auth login
fly apps create kaushalyan --org personal
fly tokens create deploy -x
```

Paste that token into the GitHub repo: **Settings → Secrets and variables → Actions → New repository secret**, name `FLY_API_TOKEN`. Then push `main`.

## Everyday commands (this computer)

```bash
make preview    # build and open http://localhost:8080
make build      # write files into dist/
make deploy     # publish to Fly.io
make note title="Something that happened"
```

## What goes where

- `content/` — the only folder she needs for text, notes, CV PDF, and photos
- `src/css`, `src/js`, `src/templates` — design, kept as separate files
- `scripts/build.mjs` — turns Markdown into HTML
- `dist/` — generated site, not edited by hand
- `VERSION` and `CHANGELOG.md` — version tracking; the footer shows the same number

## Version

Bump the number in `VERSION`, add a line to `CHANGELOG.md`, then deploy.
