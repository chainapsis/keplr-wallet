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

type ToMetric = (deep: number) => { remainder: number; prefix: string };
export const toMetric: ToMetric = (deep) => {
  switch (true) {
    case deep >= 18:
      return { remainder: deep - 18, prefix: "atto" };
    case deep >= 15:
      return { remainder: deep - 15, prefix: "femto" };
    case deep >= 12:
      return { remainder: deep - 12, prefix: "pico" };
    case deep >= 9:
      return { remainder: deep - 9, prefix: "nano" };
    case deep >= 6:
      return { remainder: deep - 6, prefix: "micro" };
    case deep >= 3:
      return { remainder: deep - 3, prefix: "milli" };
  }

  return { remainder: 0, prefix: "" };
};
