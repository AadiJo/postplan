const BLOCK_TAG_RE =
  /<\/?(address|article|aside|blockquote|br|dd|details|div|dl|dt|figcaption|figure|footer|h[1-6]|header|hr|li|main|nav|ol|p|pre|section|table|tbody|td|tfoot|th|thead|tr|ul)\b[^>]*>/gi;

const ENTITY_MAP: Record<string, string> = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  nbsp: " ",
  quot: '"',
};

function escapeAttribute(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function decodeEntity(entity: string) {
  if (entity.startsWith("#x") || entity.startsWith("#X")) {
    const codePoint = Number.parseInt(entity.slice(2), 16);
    return Number.isNaN(codePoint) ? `&${entity};` : String.fromCodePoint(codePoint);
  }

  if (entity.startsWith("#")) {
    const codePoint = Number.parseInt(entity.slice(1), 10);
    return Number.isNaN(codePoint) ? `&${entity};` : String.fromCodePoint(codePoint);
  }

  return ENTITY_MAP[entity] ?? `&${entity};`;
}

export function htmlToPlainText(html: string) {
  return html
    .replace(/<(script|style|svg)\b[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<li\b[^>]*>/gi, "\n- ")
    .replace(BLOCK_TAG_RE, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&([a-zA-Z][a-zA-Z0-9]+|#[0-9]+|#x[0-9a-fA-F]+);/g, (_match, entity: string) =>
      decodeEntity(entity),
    )
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function addPlainTextAlternate(html: string, href: string) {
  if (/rel=["'][^"']*\balternate\b[^"']*["'][^>]*type=["']text\/plain["']/i.test(html)) {
    return html;
  }

  const link = `<link rel="alternate" type="text/plain" href="${escapeAttribute(href)}">`;

  if (/<\/head>/i.test(html)) {
    return html.replace(/<\/head>/i, `  ${link}\n</head>`);
  }

  return `${link}\n${html}`;
}

export function prefersPlainText(acceptHeader: string | null) {
  if (!acceptHeader) {
    return false;
  }

  const textIndex = acceptHeader.indexOf("text/plain");
  const htmlIndex = acceptHeader.indexOf("text/html");

  return textIndex !== -1 && (htmlIndex === -1 || textIndex < htmlIndex);
}
