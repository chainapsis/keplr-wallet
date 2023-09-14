import { CoinPretty } from "@keplr-wallet/unit";

export type CopyBag = { payload: Array<[any, bigint]> };

export const displayAmount = (
  displayInfo: { assetKind: string; decimalPlaces: number; petname: string },
  value: bigint | Array<any> | { payload: Array<[any, bigint]> }
) => {
  if (displayInfo.assetKind === "nat") {
    const prettyAmount = new CoinPretty(
      {
        coinDecimals: displayInfo.decimalPlaces,
        coinDenom: displayInfo.petname,
        coinMinimalDenom: "",
      },
      value as bigint
    );
    return prettyAmount.trim(true).toString();
  }

  if (displayInfo.assetKind === "set") {
    return `${(value as Array<any>).length} ${displayInfo.petname}`;
  }

  if (displayInfo.assetKind === "copyBag") {
    const itemCount = (value as CopyBag).payload.reduce(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (total, [_item, count]) => total + count,
      BigInt(0)
    );
    return `${itemCount} ${displayInfo.petname}`;
  }
};
