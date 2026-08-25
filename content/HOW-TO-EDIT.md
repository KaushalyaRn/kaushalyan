# How to edit this website

You only need the files in the `content` folder. Do not touch `src`, `scripts`, `Dockerfile`, or `Caddyfile` unless you are changing the design.

The easiest way from a Windows laptop is to edit on GitHub in the browser. After the files are saved on GitHub, the site rebuilds and goes live by itself.

## Edit on GitHub (Windows, no extra software)

1. Open [github.com/KaushalyaRn/kaushalyan](https://github.com/KaushalyaRn/kaushalyan) while logged in as Kaushalya.
2. Click the `content` folder.
3. Open the file you want (for example `home.md` or `cv.md`).
4. Click the pencil icon (**Edit**).
5. Change the text. Keep the first block between `---` lines as it is.
6. Click **Commit changes** (green button). A short message like “Update CV” is enough.

Wait a few minutes, then refresh the live site. If the old page is still there, do a hard refresh (Ctrl+F5).

## Change your name, email, or links

Open `content/site.md`. Keep the shape:

```
email: kaushalya.nagahawatte@helsinki.fi
```

A blank value hides that link.

## Change a page

| What you want to change | File |
| --- | --- |
| Home text | `content/home.md` |
| Research | `content/research.md` |
| CV | `content/cv.md` |
| Publications | `content/publications.md` |
| Contact | `content/contact.md` |

Write ordinary sentences. Useful marks:

- `## Heading`
- `**bold**` and `*italics*` (use italics for scientific names: `*Episyrphus balteatus*`)
- `[link text](https://example.com)`
- `- bullet list`

The first block between `---` lines is settings. Leave `nav`, `order`, and `permalink` as they are unless you are adding a whole new page.

## Add a note / news item

In GitHub: `content` → `notes` → **Add file** → **Create new file**.

Name it like `2026-09-01-a-short-title.md` and paste:

```
---
title: A short title
date: 2026-09-01
summary: One or two sentences that appear on the Notes list.
---

Write the note here.
```

Then **Commit changes**.

## Replace the downloadable CV

Replace `content/files/cv.pdf` with a new PDF of the same name (GitHub: open the file → **Upload** a replacement, or delete and upload the new one).

## Add a photograph later

Put the image in `content/assets/` (for example `portrait.jpg`). Then in a Markdown file:

```
![Kaushalya in the field](/assets/portrait.jpg)
```

## If something looks broken

1. Check that every `---` frontmatter block is closed.
2. Check that every `[link](url)` has both parts.
3. On GitHub, look at the **Actions** tab. A red X means the update did not deploy; a green tick means it did.
