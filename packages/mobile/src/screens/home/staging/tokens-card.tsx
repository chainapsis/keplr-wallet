import React, { FunctionComponent } from "react";
import { Card, CardBody, CardHeader } from "../../../components/staging/card";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { AppCurrency } from "@keplr-wallet/types";
import { CoinPretty } from "@keplr-wallet/unit";
import { useStyle } from "../../../styles";
import { RightArrowIcon } from "../../../components/staging/icon";
import { RectButton } from "react-native-gesture-handler";
import { useSmartNavigation } from "../../../navigation";

export const TokensCard: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
  const { chainStore, queriesStore, accountStore } = useStore();

  const style = useStyle();

  const queryBalances = queriesStore
    .get(chainStore.current.chainId)
    .queryBalances.getQueryBech32Address(
      accountStore.getAccount(chainStore.current.chainId).bech32Address
    );

  const tokens = queryBalances.positiveNativeUnstakables.concat(
    queryBalances.nonNativeBalances
  );

  return (
    <Card style={containerStyle}>
      <CardHeader
        containerStyle={style.flatten(["padding-bottom-card-vertical-half"])}
        title="Token"
      />
      <CardBody
        style={style.flatten([
          "padding-0",
          "padding-bottom-card-vertical-half",
        ])}
      >
        {tokens.map((token) => {
          return (
            <TokenItem
              key={token.currency.coinMinimalDenom}
              currency={token.currency}
              balance={token.balance}
            />
          );
        })}
      </CardBody>
    </Card>
  );
});

export const TokenItem: FunctionComponent<{
  containerStyle?: ViewStyle;

  currency: AppCurrency;
  balance: CoinPretty;
}> = ({ containerStyle, currency, balance }) => {
  const style = useStyle();

  const smartNavigation = useSmartNavigation();

  return (
    <RectButton
      style={StyleSheet.flatten([
        style.flatten([
          "flex-row",
          "items-center",
          "padding-x-card-horizontal",
          "padding-y-card-vertical-half",
        ]),
        containerStyle,
      ])}
      onPress={() => {
        smartNavigation.navigateSmart("Send", {
          currency: currency.coinMinimalDenom,
        });
      }}
    >
      <View
        style={style.flatten([
          "width-40",
          "height-40",
          "border-radius-64",
          "background-color-border-white",
          "margin-right-12",
        ])}
      />
      <View>
        <Text
          style={style.flatten([
            "body3",
            "color-text-black-low",
            "margin-bottom-4",
            "uppercase",
          ])}
        >
          {currency.coinDenom}
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
          {balance
            .trim(true)
            .shrink(true)
            .maxDecimals(6)
            .upperCase(true)
            .toString()}
        </Text>
      </View>
      <View style={style.get("flex-1")} />
      <RightArrowIcon
        height={12}
        color={style.get("color-text-black-very-very-low").color}
      />
    </RectButton>
  );
};
