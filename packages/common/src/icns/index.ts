export function parseICNSName(name: string): [string, string] | undefined {
  const split = name.split(".");
  if (split.length === 2) {
    if (split[0].length > 0 && split[1].length > 0) {
      return [split[0], split[1]];
    }
  }

  return undefined;
}

export function validateICNSName(name: string, bech32Prefix: string): boolean {
  const parsed = parseICNSName(name);
  if (!parsed) {
    return false;
  }
  return parsed[1] === bech32Prefix;
}
