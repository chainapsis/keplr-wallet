import { CoinPretty, Dec, PricePretty } from "@keplr-wallet/unit";

export interface ViewTokenWithPrice {
  token: CoinPretty;
  price: PricePretty | undefined;
}

const zeroDec = new Dec(0);

export function sortByPrice(
  a: ViewTokenWithPrice,
  b: ViewTokenWithPrice
): number {
  const aPrice = a.price?.toDec() ?? zeroDec;
  const bPrice = b.price?.toDec() ?? zeroDec;

  if (aPrice.equals(bPrice)) {
    if (aPrice.equals(zeroDec)) {
      const aHasBalance = a.token.toDec().gt(zeroDec);
      const bHasBalance = b.token.toDec().gt(zeroDec);
      if (aHasBalance && !bHasBalance) return -1;
      if (!aHasBalance && bHasBalance) return 1;
      return 0;
    }
    return 0;
  }
  return aPrice.gt(bPrice) ? -1 : 1;
}

type ViewTokenWithOptionalPrice = {
  token: CoinPretty;
  price?: PricePretty | undefined;
};

export function sortTokenGroups(
  tokensA: ViewTokenWithOptionalPrice[],
  tokensB: ViewTokenWithOptionalPrice[]
): number {
  let valueA = new Dec(0);
  let valueB = new Dec(0);
  let aHasBalance = false;
  let bHasBalance = false;

  for (const token of tokensA) {
    if (token.price) valueA = valueA.add(token.price.toDec());
    if (
      (!token.price || token.price.toDec().equals(zeroDec)) &&
      token.token.toDec().gt(zeroDec)
    ) {
      aHasBalance = true;
    }
  }
  for (const token of tokensB) {
    if (token.price) valueB = valueB.add(token.price.toDec());
    if (
      (!token.price || token.price.toDec().equals(zeroDec)) &&
      token.token.toDec().gt(zeroDec)
    ) {
      bHasBalance = true;
    }
  }

  if (valueA.equals(valueB)) {
    if (valueA.equals(zeroDec)) {
      if (aHasBalance && !bHasBalance) return -1;
      if (!aHasBalance && bHasBalance) return 1;
      return 0;
    }
    return 0;
  }
  return valueA.gt(valueB) ? -1 : 1;
}
