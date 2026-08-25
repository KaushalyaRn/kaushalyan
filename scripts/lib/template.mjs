function lookup(ctx, path) {
  return path.split(".").reduce((acc, key) => (acc == null ? acc : acc[key]), ctx);
}

function renderSection(source, ctx) {
  let out = source.replace(/\{\{#if\s+([\w.]+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (_, key, inner) => {
    const value = lookup(ctx, key);
    if (!value) return "";
    return render(inner, ctx);
  });

  out = out.replace(/\{\{#each\s+([\w.]+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (_, key, inner) => {
    const list = lookup(ctx, key);
    if (!Array.isArray(list) || !list.length) return "";
    return list.map((item) => render(inner, { ...ctx, ...item, this: item })).join("");
  });

  return out;
}

export function render(source, ctx) {
  const withSections = renderSection(source, ctx);
  return withSections.replace(/\{\{\{?\s*([\w.]+)\s*\}?\}\}/g, (match, key) => {
    const value = lookup(ctx, key);
    if (value == null) return "";
    const text = String(value);
    const triple = match.startsWith("{{{");
    return triple ? text : text
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  });
}
