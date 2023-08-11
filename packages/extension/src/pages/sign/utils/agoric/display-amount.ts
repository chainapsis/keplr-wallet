import { CoinPretty } from "@keplr-wallet/unit";

export const displayAmount = (
  displayInfo: { assetKind: string; decimalPlaces: number; petname: string },
  value: bigint | Array<any>
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

  return `${(value as Array<any>).length} ${displayInfo.petname}`;
};
