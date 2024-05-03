import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";

import { useStore } from "stores/index";
import { TokenCardView } from "components/new/card-view/token-card-view";
import { ViewStyle } from "react-native";
import { useStyle } from "styles/index";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { AppCurrency } from "@keplr-wallet/types";
import { TokenSymbolUsingChainInfo } from "components/token-symbol/token-symbol-chain";
import { separateNumericAndDenom } from "utils/format/format";
import {
  NavigationProp,
  ParamListBase,
  useNavigation,
} from "@react-navigation/native";

export const NativeTokensSection: FunctionComponent = observer(() => {
  const style = useStyle();

  const { chainStore, queriesStore, accountStore, priceStore } = useStore();
  const current = chainStore.current;
  const queries = queriesStore.get(current.chainId);

  const accountInfo = accountStore.getAccount(current.chainId);

  const balanceQuery = queries.queryBalances.getQueryBech32Address(
    accountInfo.bech32Address
  );
  const balanceStakableQuery = balanceQuery.stakable;
  const isNoble =
    ChainIdHelper.parse(chainStore.current.chainId).identifier === "noble";
  const hasUSDC = chainStore.current.currencies.find(
    (currency: AppCurrency) => currency.coinMinimalDenom === "uusdc"
  );
  const stakable = (() => {
    if (isNoble && hasUSDC) {
      return balanceQuery.getBalanceFromCurrency(hasUSDC);
    }

    return balanceStakableQuery.balance;
  })();

  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { numericPart: totalNumber, denomPart: totalDenom } =
    separateNumericAndDenom(
      stakable.shrink(true).trim(true).maxDecimals(6).toString()
    );
  const totalPrice = priceStore.calculatePrice(stakable);

  const NativeTokenDetailsString = encodeURIComponent(
    JSON.stringify(balanceQuery.balances[0].balance?.currency)
  );
  const NativeTokenBalance = {
    balance: totalNumber,
    totalDenom: totalDenom,
    balanceInUsd: totalPrice && totalPrice.toString(),
  };
  const NativeTokenBalanceString = encodeURIComponent(
    JSON.stringify(NativeTokenBalance)
  );

  return (
    <TokenCardView
      containerStyle={style.flatten(["margin-y-4"]) as ViewStyle}
      key={stakable.currency.coinMinimalDenom}
      onPress={() =>
        navigation.navigate("Others", {
          screen: "NativeTokens",
          params: {
            tokenString: NativeTokenDetailsString,
            tokenBalanceString: NativeTokenBalanceString,
          },
        })
      }
      leadingIcon={
        <TokenSymbolUsingChainInfo
          size={44}
          chainInfo={chainStore.current}
          currency={stakable.currency}
        />
      }
      title={totalDenom}
      subtitle={stakable.shrink(true).maxDecimals(6).toString()}
      trailingStart={totalPrice ? `${totalPrice.toString()}` : ""}
      trailingEnd={totalPrice ? priceStore.defaultVsCurrency.toUpperCase() : ""}
    />
  );
});
