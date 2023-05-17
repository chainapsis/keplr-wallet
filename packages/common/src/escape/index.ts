/**
 * Escapes <,>,& in string.
 * Golang's json marshaller escapes <,>,& by default.
 * However, because JS doesn't do that by default, to match the sign doc with cosmos-sdk,
 * we should escape <,>,& in string manually.
 * @param str
 */
export function escapeHTML(str: string): string {
  return str
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

/**
 * Unescapes \u003c/(<),\u003e(>),\u0026(&) in string.
 * Golang's json marshaller escapes <,>,& by default, whilst for most of the users, such escape characters are unfamiliar.
 * This function can be used to show the escaped characters with more familiar characters.
 * @param str
 */
export function unescapeHTML(str: string): string {
  return str
    .replace(/\\u003c/g, "<")
    .replace(/\\u003e/g, ">")
    .replace(/\\u0026/g, "&");
}
