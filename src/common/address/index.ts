export function shortenAddress(bech32: string, maxCharacters: number): string {
  if (maxCharacters >= bech32.length) {
    return bech32;
  }

  const i = bech32.indexOf("1");
  const prefix = bech32.slice(0, i);
  const address = bech32.slice(i + 1);

  maxCharacters -= prefix.length;
  maxCharacters -= 3; // For "..."
  maxCharacters -= 1; // For "1"

  if (maxCharacters <= 0) {
    return "";
  }

  const mid = Math.floor(address.length / 2);
  let former = address.slice(0, mid);
  let latter = address.slice(mid);

  while (maxCharacters < former.length + latter.length) {
    if ((former.length + latter.length) % 2 === 1 && former.length > 0) {
      former = former.slice(0, former.length - 1);
    } else {
      latter = latter.slice(1);
    }
  }

  return prefix + "1" + former + "..." + latter;
}
