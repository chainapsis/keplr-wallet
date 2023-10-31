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

type ToMetric = (
  deep: number,
  isEvm?: boolean
) => { remainder: number; prefix: string };
export const toMetric: ToMetric = (deep, isEvm = false) => {
  switch (true) {
    case deep >= 18:
      return { remainder: deep - 18, prefix: !isEvm ? "atto" : "wei" };
    case deep >= 15:
      return { remainder: deep - 15, prefix: !isEvm ? "femto" : "kwei" };
    case deep >= 12:
      return { remainder: deep - 12, prefix: !isEvm ? "pico" : "mwei" };
    case deep >= 9:
      return { remainder: deep - 9, prefix: !isEvm ? "nano" : "gwei" };
    case deep >= 6:
      return { remainder: deep - 6, prefix: !isEvm ? "micro" : "twei" };
    case deep >= 3:
      return { remainder: deep - 3, prefix: !isEvm ? "milli" : "pwei" };
  }

  return { remainder: 0, prefix: "" };
};
