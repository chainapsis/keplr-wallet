export function isValidCoinStr(str: string): boolean {
  const split = str.split(/^([0-9]+)(\s)*([a-zA-Z][a-zA-Z0-9/-]*)$/);

  if (split.length === 5) {
    if (
      split[1].length > 0 &&
      split[3].length > 0 &&
      !Number.isNaN(parseInt(split[1]))
    ) {
      return true;
    }
  }

  return false;
}

export function parseCoinStr(str: string): {
  denom: string;
  amount: string;
} {
  const split = str.split(/^([0-9]+)(\s)*([a-zA-Z][a-zA-Z0-9/-]*)$/);

  if (split.length === 5) {
    const denom = split[3];
    return {
      denom,
      amount: split[1],
    };
  }

  throw new Error(`Invalid coin string: ${str}`);
}
