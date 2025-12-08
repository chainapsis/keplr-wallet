export function safeToBigInt(
  value: { toString(): string } | null | undefined
): bigint {
  if (value === null || value === undefined) {
    return BigInt(0);
  }
  const val = value.toString();
  return BigInt(val === "0x" ? "0" : val);
}
