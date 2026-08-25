import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseFrontmatter } from "./lib/frontmatter.mjs";
import { renderMarkdown } from "./lib/markdown.mjs";
import { render } from "./lib/template.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = path.join(root, "content");
const srcDir = path.join(root, "src");
const distDir = path.join(root, "dist");

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function write(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, data);
}

function copyDir(from, to) {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name);
    const dest = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(src, dest);
    else fs.copyFileSync(src, dest);
  }
}

function loadMarkdown(file) {
  const { data, body } = parseFrontmatter(read(file));
  return { ...data, body, html: renderMarkdown(body), source: file };
}

function formatDate(iso) {
  if (!iso) return "";
  const date = new Date(`${iso}T00:00:00`);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function isoDate(iso) {
  return iso || "";
}

function navClass(page, current) {
  const norm = (url) => (url === "/index.html" || url === "" ? "/" : url);
  return norm(page.permalink) === norm(current) ? "is-active" : "";
}

function distFile(permalink) {
  if (permalink === "/" || permalink === "/index.html") {
    return path.join(distDir, "index.html");
  }
  return path.join(distDir, permalink.replace(/^\//, ""));
}

function build() {
  fs.rmSync(distDir, { recursive: true, force: true });
  fs.mkdirSync(distDir, { recursive: true });

  const version = read(path.join(root, "VERSION")).trim();
  const builtAt = new Date().toISOString().slice(0, 10);
  const site = loadMarkdown(path.join(contentDir, "site.md"));
  const templates = {
    base: read(path.join(srcDir, "templates", "base.html")),
    home: read(path.join(srcDir, "templates", "home.html")),
    page: read(path.join(srcDir, "templates", "page.html")),
    notes: read(path.join(srcDir, "templates", "notes.html")),
    note: read(path.join(srcDir, "templates", "note.html")),
    notfound: read(path.join(srcDir, "templates", "404.html")),
  };
  const hoverfly = read(path.join(srcDir, "assets", "hoverfly.svg"));
  const meadow = read(path.join(srcDir, "assets", "meadow.svg"));

  const pages = fs.readdirSync(contentDir)
    .filter((name) => name.endsWith(".md") && name !== "site.md" && name !== "HOW-TO-EDIT.md")
    .map((name) => {
      const page = loadMarkdown(path.join(contentDir, name));
      page.slug = name.replace(/\.md$/, "");
      page.permalink = page.permalink || (page.slug === "home" ? "/" : `/${page.slug}.html`);
      page.order = Number(page.order || 99);
      return page;
    })
    .sort((a, b) => a.order - b.order);

  const notesDir = path.join(contentDir, "notes");
  const notes = fs.existsSync(notesDir)
    ? fs.readdirSync(notesDir)
      .filter((name) => name.endsWith(".md"))
      .map((name) => {
        const note = loadMarkdown(path.join(notesDir, name));
        note.slug = name.replace(/\.md$/, "");
        note.permalink = `/notes/${note.slug}.html`;
        note.date_fmt = formatDate(note.date);
        note.date_iso = isoDate(note.date);
        return note;
      })
      .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    : [];

  const cvPath = path.join(contentDir, "files", "cv.pdf");
  const hasCv = fs.existsSync(cvPath);

  const nav = pages
    .filter((page) => page.nav)
    .map((page) => ({
      label: page.nav,
      url: page.permalink,
      permalink: page.permalink,
    }));

  const social = [
    { label: "Email", url: site.email ? `mailto:${site.email}` : "" },
    { label: "ORCID", url: site.orcid || "" },
    { label: "Lab", url: site.lab || "" },
    { label: "LinkedIn", url: site.linkedin || "" },
    { label: "Instagram", url: site.instagram || "" },
    { label: "X", url: site.x || "" },
  ].filter((item) => item.url);

  copyDir(path.join(srcDir, "css"), path.join(distDir, "css"));
  copyDir(path.join(srcDir, "js"), path.join(distDir, "js"));
  copyDir(path.join(srcDir, "assets"), path.join(distDir, "assets"));
  copyDir(path.join(contentDir, "assets"), path.join(distDir, "assets"));
  if (hasCv) {
    fs.mkdirSync(path.join(distDir, "files"), { recursive: true });
    fs.copyFileSync(cvPath, path.join(distDir, "files", "cv.pdf"));
  }

  const baseCtx = {
    site_name: site.name,
    site_role: site.role,
    site_affiliation: site.affiliation,
    site_location: site.location,
    site_email: site.email,
    site_url: site.url,
    site_tagline: site.tagline,
    description: site.description,
    version,
    built_at: builtAt,
    hoverfly,
    meadow,
    has_cv: hasCv,
    social,
    notes,
    notes_count: notes.length,
  };

  function pageContext(page) {
    const title = page.slug === "home"
      ? `${site.name} — ${site.role}`
      : `${page.title} — ${site.name}`;
    return {
      ...baseCtx,
      ...page,
      page_title: title,
      page_class: page.slug,
      body: page.html,
      download_cv: Boolean(page.download_cv) && hasCv,
      nav: nav.map((item) => ({ ...item, active: navClass(item, page.permalink) })),
    };
  }

  function wrap(inner, ctx) {
    return render(templates.base, { ...ctx, body: inner });
  }

  for (const page of pages) {
    const ctx = pageContext(page);
    const kind = page.template || (page.slug === "notes" ? "notes" : page.slug === "home" ? "home" : "page");
    const inner = render(templates[kind] || templates.page, ctx);
    write(distFile(page.permalink), wrap(inner, ctx));
  }

  for (const note of notes) {
    const ctx = {
      ...baseCtx,
      ...note,
      page_title: `${note.title} — ${site.name}`,
      page_class: "note",
      body: note.html,
      nav: nav.map((item) => ({
        ...item,
        active: item.permalink === "/notes.html" ? "is-active" : "",
      })),
    };
    const inner = render(templates.note, ctx);
    write(path.join(distDir, "notes", `${note.slug}.html`), wrap(inner, ctx));
  }

  const notFoundCtx = pageContext({
    slug: "404",
    title: "Page not found",
    permalink: "/404.html",
    html: "<p>That page has flown off. Try the menu, or return home.</p>",
  });
  write(path.join(distDir, "404.html"), wrap(render(templates.notfound, notFoundCtx), notFoundCtx));

  const urls = [
    ...pages.map((page) => page.permalink),
    ...notes.map((note) => note.permalink),
  ];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${site.url}${url === "/index.html" || url === "/" ? "/" : url}</loc></url>`).join("\n")}
</urlset>
`;
  write(path.join(distDir, "sitemap.xml"), sitemap);
  write(path.join(distDir, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${site.url}/sitemap.xml\n`);

  console.log(`Built v${version} → dist/ (${pages.length} pages, ${notes.length} notes)`);
}

build();
