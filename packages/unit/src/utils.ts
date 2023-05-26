/**
 * Change the non-locale integer string to locale string.
 * Only support en-US format.
 * This method uses the BigInt if the environment supports the BigInt.
 * @param numberStr
 */
export function integerStringToUSLocaleString(numberStr: string): string {
  if (numberStr.indexOf(".") >= 0) {
    throw new Error(`${numberStr} is not integer`);
  }

  if (typeof BigInt !== "undefined") {
    return BigInt(numberStr).toLocaleString("en-US");
  }

  const integer = numberStr;

  const chunks: string[] = [];
  for (let i = integer.length; i > 0; i -= 3) {
    chunks.push(integer.slice(Math.max(0, i - 3), i));
  }

  return chunks.reverse().join(",");
}
