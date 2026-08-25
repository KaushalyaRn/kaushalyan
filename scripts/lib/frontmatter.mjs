const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

function coerce(value) {
  const trimmed = value.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (trimmed === "") return "";
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
  return trimmed;
}

export function parseFrontmatter(raw) {
  const match = raw.match(FRONTMATTER);
  if (!match) {
    return { data: {}, body: raw.trim() };
  }

  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    data[key] = coerce(line.slice(idx + 1));
  }

  return { data, body: raw.slice(match[0].length).trim() };
}
