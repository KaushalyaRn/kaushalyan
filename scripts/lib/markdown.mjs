function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function inline(text) {
  const codes = [];
  let html = text.replace(/`([^`]+)`/g, (_, code) => {
    codes.push(`<code>${escapeHtml(code)}</code>`);
    return `%%CODE${codes.length - 1}%%`;
  });

  html = escapeHtml(html);
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");

  return html.replace(/%%CODE(\d+)%%/g, (_, i) => codes[Number(i)]);
}

function closeList(stack, html) {
  while (stack.length) {
    html.push(`</${stack.pop()}>`);
  }
  return html;
}

export function renderMarkdown(src) {
  const lines = src.replaceAll("\r\n", "\n").split("\n");
  const out = [];
  const listStack = [];
  let inBlockquote = false;
  let paragraph = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    out.push(`<p>${inline(paragraph.join(" "))}</p>`);
    paragraph = [];
  };

  const endQuote = () => {
    if (!inBlockquote) return;
    flushParagraph();
    closeList(listStack, out);
    out.push("</blockquote>");
    inBlockquote = false;
  };

  for (let i = 0; i < lines.length; i += 1) {
    const raw = lines[i];

    if (raw.startsWith("<") && raw.trim().endsWith(">")) {
      flushParagraph();
      closeList(listStack, out);
      endQuote();
      out.push(raw);
      continue;
    }

    const quoted = raw.match(/^>\s?(.*)$/);
    if (quoted) {
      flushParagraph();
      closeList(listStack, out);
      if (!inBlockquote) {
        out.push("<blockquote>");
        inBlockquote = true;
      }
      if (quoted[1].trim()) paragraph.push(quoted[1]);
      else flushParagraph();
      continue;
    }
    if (inBlockquote && !quoted && raw.trim() !== "") {
      endQuote();
    }

    if (/^---+$/.test(raw.trim())) {
      flushParagraph();
      closeList(listStack, out);
      endQuote();
      out.push("<hr />");
      continue;
    }

    const heading = raw.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      closeList(listStack, out);
      endQuote();
      const level = heading[1].length;
      out.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      continue;
    }

    const ul = raw.match(/^[-*]\s+(.+)$/);
    if (ul) {
      flushParagraph();
      endQuote();
      if (!listStack.includes("ul")) {
        closeList(listStack, out);
        out.push("<ul>");
        listStack.push("ul");
      }
      out.push(`<li>${inline(ul[1])}</li>`);
      continue;
    }

    const ol = raw.match(/^\d+\.\s+(.+)$/);
    if (ol) {
      flushParagraph();
      endQuote();
      if (!listStack.includes("ol")) {
        closeList(listStack, out);
        out.push("<ol>");
        listStack.push("ol");
      }
      out.push(`<li>${inline(ol[1])}</li>`);
      continue;
    }

    if (!raw.trim()) {
      flushParagraph();
      closeList(listStack, out);
      endQuote();
      continue;
    }

    if (listStack.length) closeList(listStack, out);
    paragraph.push(raw.trim());
  }

  flushParagraph();
  closeList(listStack, out);
  endQuote();
  return out.join("\n");
}
