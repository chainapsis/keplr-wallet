export function truncHashPortion(
  str: string,
  firstCharCount = str.length,
  endCharCount = 0
): string {
  return (
    str.substring(0, firstCharCount) +
    "…" +
    str.substring(str.length - endCharCount, str.length)
  );
}
