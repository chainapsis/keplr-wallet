import { useMemo } from "react";
import { ViewToken } from "../pages/main";
import { DenomHelper } from "@keplr-wallet/common";

export const useTokenTag = (viewToken: ViewToken) => {
  return useMemo(() => {
    const currency = viewToken.token.currency;
    const denomHelper = new DenomHelper(currency.coinMinimalDenom);

    if (denomHelper.type === "native") {
      if (currency.coinMinimalDenom.startsWith("ibc/")) {
        return {
          text: "IBC",
          tooltip: (() => {
            const start = currency.coinDenom.indexOf("(");
            const end = currency.coinDenom.lastIndexOf(")");

            if (start < 0 || end < 0) {
              return "Unknown";
            }

            return currency.coinDenom.slice(start + 1, end);
          })(),
        };
      }

      if (viewToken.chainInfo.chainId.startsWith("bip122:")) {
        const paymentType = viewToken.chainInfo.chainId.split(":")[2] as
          | string
          | undefined;
        if (paymentType) {
          return {
            text: paymentType
              .split("-")
              .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
              .join(" "),
          };
        }
      }
    } else {
      if (denomHelper.type === "erc20") {
        return undefined;
      }
      return {
        text: denomHelper.type.toUpperCase(),
      };
    }
  }, [viewToken.token.currency, viewToken.chainInfo.chainId]);
};
