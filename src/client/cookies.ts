/**
 * Minimal cookie jar helpers.
 *
 * note.com answers many requests with Set-Cookie headers that only refresh a
 * few cookies. Replacing the whole Cookie header with them would drop the
 * session cookie (`_note_session_v5`), so new cookies are merged by name.
 */

function parseCookieHeader(header: string): Map<string, string> {
  const jar = new Map<string, string>();
  for (const part of header.split(";")) {
    const pair = part.trim();
    if (!pair) continue;
    const eq = pair.indexOf("=");
    if (eq <= 0) continue;
    jar.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim());
  }
  return jar;
}

function isExpired(attributes: string[]): boolean {
  for (const attr of attributes) {
    const [rawName, ...rest] = attr.split("=");
    const name = rawName.trim().toLowerCase();
    const value = rest.join("=").trim();
    if (name === "max-age" && Number(value) <= 0) return true;
    if (name === "expires") {
      const time = Date.parse(value);
      if (!Number.isNaN(time) && time <= Date.now()) return true;
    }
  }
  return false;
}

/**
 * Merges Set-Cookie response headers into an existing Cookie header value.
 * Cookies deleted by the server (expired / Max-Age=0) are removed.
 */
export function mergeCookies(
  current: string | null,
  setCookies: string[] | undefined,
): string | null {
  if (!setCookies || setCookies.length === 0) return current;
  const jar = parseCookieHeader(current ?? "");
  for (const setCookie of setCookies) {
    const [pair, ...attributes] = setCookie.split(";");
    const eq = pair.indexOf("=");
    if (eq <= 0) continue;
    const name = pair.slice(0, eq).trim();
    const value = pair.slice(eq + 1).trim();
    if (isExpired(attributes)) {
      jar.delete(name);
    } else {
      jar.set(name, value);
    }
  }
  if (jar.size === 0) return null;
  return [...jar].map(([name, value]) => `${name}=${value}`).join("; ");
}
