/** Throws a TypeError when a required string/number argument is missing or empty. */
export function requireParam(name: string, value: unknown): string {
  if (value === undefined || value === null || String(value).trim() === "") {
    throw new TypeError(`note-api-client: "${name}" is required`);
  }
  return String(value).trim();
}

/** Encodes a value for use as a single URL path segment. */
export function pathSegment(name: string, value: unknown): string {
  return encodeURIComponent(requireParam(name, value));
}

/** "#AI" / "＃AI" / "AI" -> "AI" */
export function normalizeHashtag(hashtag: string): string {
  return requireParam("hashtag", hashtag).replace(/^[#＃]+/, "");
}

/** Validates a 1-based page number. */
export function pageParam(page: number | undefined, defaultPage = 1): number {
  const value = page ?? defaultPage;
  if (!Number.isInteger(value) || value < 1) {
    throw new RangeError(`note-api-client: "page" must be an integer >= 1 (got ${page})`);
  }
  return value;
}
