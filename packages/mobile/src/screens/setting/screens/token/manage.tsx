import React, { FunctionComponent } from "react";
import { PageWithScrollView } from "../../../../components/page";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { CoinPretty } from "@keplr-wallet/unit";
import { useStyle } from "../../../../styles";
import { TrashCanIcon } from "../../../../components/icon";
import { Card } from "../../../../components/card";
import { Currency } from "@keplr-wallet/types";
import { TokenSymbol } from "../../../../components/token-symbol";
import { BorderlessButton } from "react-native-gesture-handler";
import { useConfirmModal } from "../../../../providers/confirm-modal";
import { useNavigation } from "@react-navigation/native";

export const SettingManageTokensScreen: FunctionComponent = observer(() => {
  const { chainStore, queriesStore, accountStore, tokensStore } = useStore();

  const style = useStyle();

  const tokensOf = tokensStore.getTokensOf(chainStore.current.chainId);

  const queryBalances = queriesStore
    .get(chainStore.current.chainId)
    .queryBalances.getQueryBech32Address(
      accountStore.getAccount(chainStore.current.chainId).bech32Address
    );

  return (
    <PageWithScrollView backgroundMode="secondary">
      {tokensOf.tokens.length > 0 ? (
        <Card style={style.flatten(["padding-bottom-14"])}>
          {tokensOf.tokens.map((token) => {
            const balance = queryBalances.getBalanceFromCurrency(token);

            return (
              <ManageTokenItem
                key={token.coinMinimalDenom}
                chainInfo={chainStore.current}
                balance={balance}
              />
            );
          })}
        </Card>
      ) : null}
    </PageWithScrollView>
  );
});

export const ManageTokenItem: FunctionComponent<{
  containerStyle?: ViewStyle;

  chainInfo: {
    stakeCurrency: Currency;
  };
  balance: CoinPretty;
}> = observer(({ containerStyle, chainInfo, balance }) => {
  const { chainStore, tokensStore } = useStore();

  const style = useStyle();

  const tokensOf = tokensStore.getTokensOf(chainStore.current.chainId);

  const navigation = useNavigation();

  const confirmModal = useConfirmModal();

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
    <View
      style={StyleSheet.flatten([
        style.flatten([
          "flex-row",
          "items-center",
          "padding-x-card-horizontal",
          "padding-y-14",
        ]),
        containerStyle,
      ])}
    >
      <TokenSymbol
        style={style.flatten(["margin-right-12"])}
        size={44}
        chainInfo={chainInfo}
        currency={balance.currency}
      />
      <View>
        <Text
          style={style.flatten([
            "subtitle3",
            "color-text-low",
            "margin-bottom-4",
            "uppercase",
          ])}
        >
          {balance.currency.coinDenom}
        </Text>
        <Text
          style={style.flatten(["h5", "color-text-middle", "max-width-240"])}
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
      <View
        style={{
          width: 28,
          height: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <BorderlessButton
          style={{
            position: "absolute",
            width: 36,
            height: 36,
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={async () => {
            if (
              await confirmModal.confirm({
                title: "Disable this token?",
                paragraph:
                  "You won't see this token in your wallet until it is added again",
                yesButtonText: "Disable",
                noButtonText: "Cancel",
              })
            ) {
              await tokensOf.removeToken(balance.currency);

              if (tokensOf.tokens.length === 0 && navigation.canGoBack()) {
                navigation.goBack();
              }
            }
          }}
        >
          <TrashCanIcon
            size={28}
            color={
              style.flatten(["color-gray-100", "dark:color-platinum-300"]).color
            }
          />
        </BorderlessButton>
      </View>
    </View>
  );
});
