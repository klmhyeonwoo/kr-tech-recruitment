/**
 * Safely serializes JSON data for use in script tags.
 * Escapes characters that could break out of script tags or cause XSS.
 */
export function safeJsonStringify(data: unknown): string {
  const json = JSON.stringify(data);
  // Replace characters that could break out of script tags or enable XSS
  return json
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
