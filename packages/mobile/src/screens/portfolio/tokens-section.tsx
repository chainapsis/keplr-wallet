import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";

import { useStore } from "stores/index";
import { TokenCardView } from "components/new/card-view/token-card-view";
import { CoinPretty, Dec, Int } from "@keplr-wallet/unit";
import { DenomHelper } from "@keplr-wallet/common";
import { ViewStyle } from "react-native";
import { useStyle } from "styles/index";
import { TokenSymbol } from "components/token-symbol";
import {
  NavigationProp,
  ParamListBase,
  useNavigation,
} from "@react-navigation/native";
import { separateNumericAndDenom } from "utils/format/format";

export const TokensSection: FunctionComponent = observer(() => {
  const style = useStyle();
  const { chainStore, queriesStore, accountStore, priceStore } = useStore();
  const current = chainStore.current;
  const accountInfo = accountStore.getAccount(current.chainId);
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  const tokens = queriesStore
    .get(current.chainId)
    .queryBalances.getQueryBech32Address(accountInfo.bech32Address)
    .unstakables.filter((bal) => {
      if (
        chainStore.current.features &&
        chainStore.current.features.includes("terra-classic-fee")
      ) {
        const denom = new DenomHelper(bal.currency.coinMinimalDenom);
        if (denom.type !== "native" || denom.denom.startsWith("ibc/")) {
          return false;
        }
        if (denom.type === "native") {
          return bal.balance.toDec().gt(new Dec("0"));
        }
      }

      return true;
    })
    .sort((a, b) => {
      const aDecIsZero = a.balance.toDec().isZero();
      const bDecIsZero = b.balance.toDec().isZero();

      if (aDecIsZero && !bDecIsZero) {
        return 1;
      }
      if (!aDecIsZero && bDecIsZero) {
        return -1;
      }

      return a.currency.coinDenom < b.currency.coinDenom ? -1 : 1;
    });

  const convertToUsd = (currency: any) => {
    const value = priceStore.calculatePrice(currency);
    return value && value.shrink(true).maxDecimals(6).toString();
  };

  function balanceCoinDenom(balance: CoinPretty): string {
    if (
      "originCurrency" in balance.currency &&
      balance.currency.originCurrency
    ) {
      return balance.currency.originCurrency.coinDenom;
    }
    return balance.currency.coinDenom;
  }

  return (
    <React.Fragment>
      {tokens.length > 0 &&
        tokens.map((token) => {
          const tokenInfo = token.balance.currency;

          const amountInNumber =
            parseFloat(
              token.balance.maxDecimals(6).hideDenom(false).toString()
            ) *
            10 ** token.currency.coinDecimals;

          const inputValue = new CoinPretty(
            tokenInfo,
            new Int(tokenInfo ? amountInNumber : 0)
          );

          const tokenInUsd = convertToUsd(inputValue);
          const amount = tokenInUsd
            ? tokenInUsd.toString().replace(/[^0-9\.]+/g, "")
            : "";
          const currency = tokenInUsd
            ? tokenInUsd.toString().replace(/[^a-zA-Z ]/g, "")
            : "";

          const { numericPart: totalNumber, denomPart: totalDenom } =
            separateNumericAndDenom(
              token.balance.shrink(true).trim(true).maxDecimals(6).toString()
            );

          const tokenString = encodeURIComponent(JSON.stringify(tokenInfo));
          const tokenBalance = {
            balance: totalNumber,
            totalDenom: totalDenom,
            balanceInUsd: tokenInUsd ? tokenInUsd : "",
          };
          const tokenBalanceString = encodeURIComponent(
            JSON.stringify(tokenBalance)
          );

          return (
            <TokenCardView
              containerStyle={style.flatten(["margin-y-4"]) as ViewStyle}
              key={token.currency.coinMinimalDenom}
              onPress={() =>
                navigation.navigate("Others", {
                  screen: "NativeTokens",
                  params: {
                    tokenString: tokenString,
                    tokenBalanceString: tokenBalanceString,
                  },
                })
              }
              leadingIcon={
                <TokenSymbol
                  size={32}
                  image={
                    token.currency.coinImageUrl
                      ? token.currency.coinImageUrl
                      : token.currency.coinDenom[0].toUpperCase()
                  }
                />
              }
              title={token.balance.currency.coinDenom}
              subtitle={`${token.balance
                .trim(true)
                .shrink(true)
                .maxDecimals(6)
                .upperCase(true)
                .hideDenom(true)
                .toString()} ${balanceCoinDenom(token.balance)}`}
              trailingStart={amount}
              trailingEnd={currency}
            />
          );
        })}
    </React.Fragment>
  );
});
