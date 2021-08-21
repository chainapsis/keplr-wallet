import React, { FunctionComponent } from "react";
import { PageWithScrollView } from "../../components/staging/page";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { CoinPretty } from "@keplr-wallet/unit";
import { useStyle } from "../../styles";
import { useSmartNavigation } from "../../navigation";
import { RightArrowIcon } from "../../components/staging/icon";
import { Card } from "../../components/staging/card";
import { RectButton } from "../../components/staging/rect-button";

export const TokensScreen: FunctionComponent = observer(() => {
  const { chainStore, queriesStore, accountStore } = useStore();

  const style = useStyle();

  const queryBalances = queriesStore
    .get(chainStore.current.chainId)
    .queryBalances.getQueryBech32Address(
      accountStore.getAccount(chainStore.current.chainId).bech32Address
    );

  const tokens = queryBalances.balances;

  return (
    <PageWithScrollView>
      <Card style={style.flatten(["padding-bottom-14"])}>
        {tokens.map((token) => {
          return (
            <TokenItem
              key={token.currency.coinMinimalDenom}
              balance={token.balance}
            />
          );
        })}
      </Card>
    </PageWithScrollView>
  );
});

export const TokenItem: FunctionComponent<{
  containerStyle?: ViewStyle;

  balance: CoinPretty;
}> = ({ containerStyle, balance }) => {
  const style = useStyle();

  const smartNavigation = useSmartNavigation();

  // The IBC currency could have long denom (with the origin chain/channel information).
  // Because it is shown in the title, there is no need to show such long denom twice in the actual balance.
  const balanceCoinDenom = (() => {
    if (
      "originCurrency" in balance.currency &&
      balance.currency.originCurrency
    ) {
      return balance.currency.originCurrency.coinDenom;
    }
    return balance.currency.coinDenom;
  })();

  return (
    <RectButton
      style={StyleSheet.flatten([
        style.flatten([
          "flex-row",
          "items-center",
          "padding-x-card-horizontal",
          "padding-y-14",
        ]),
        containerStyle,
      ])}
      onPress={() => {
        smartNavigation.navigateSmart("Send", {
          currency: balance.currency.coinMinimalDenom,
        });
      }}
    >
      <View
        style={style.flatten([
          "width-44",
          "height-44",
          "border-radius-64",
          "background-color-border-white",
          "margin-right-12",
        ])}
      />
      <View>
        <Text
          style={style.flatten([
            "subtitle3",
            "color-text-black-low",
            "margin-bottom-4",
            "uppercase",
          ])}
        >
          {balance.currency.coinDenom}
        </Text>
        <Text
          style={style.flatten([
            "h5",
            "color-text-black-medium",
            "max-width-300",
          ])}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {`${balance
            .trim(true)
            .shrink(true)
            .maxDecimals(6)
            .upperCase(true)
            .hideDenom(true)
            .toString()} ${balanceCoinDenom}`}
        </Text>
      </View>
      <View style={style.get("flex-1")} />
      <RightArrowIcon
        height={16}
        color={style.get("color-text-black-very-very-low").color}
      />
    </RectButton>
  );
};
