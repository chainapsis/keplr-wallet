import React, { FunctionComponent, useState } from "react";
import { PageWithScrollView } from "components/page";
import { observer } from "mobx-react-lite";
import { useStore } from "stores/index";
import { Text, View, ViewStyle } from "react-native";
import { CoinPretty } from "@keplr-wallet/unit";
import { useStyle } from "styles/index";
import { TrashCanIcon } from "components/icon";
import { Currency } from "@keplr-wallet/types";
import { BorderlessButton } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import { BlurBackground } from "components/new/blur-background/blur-background";
import { ConfirmCardModel } from "components/new/confirm-modal";

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
    <PageWithScrollView
      backgroundMode="image"
      contentContainerStyle={style.get("flex-grow-1")}
      style={style.flatten(["padding-x-page"]) as ViewStyle}
    >
      <View style={style.flatten(["height-card-gap"]) as ViewStyle} />
      {tokensOf.tokens.length > 0
        ? tokensOf.tokens.map((token) => {
            const balance = queryBalances.getBalanceFromCurrency(token);

            return (
              <ManageTokenItem
                key={token.coinMinimalDenom}
                chainInfo={chainStore.current}
                balance={balance}
              />
            );
          })
        : null}
      <View style={style.flatten(["height-page-pad"]) as ViewStyle} />
    </PageWithScrollView>
  );
});

export const ManageTokenItem: FunctionComponent<{
  containerStyle?: ViewStyle;

  chainInfo: {
    stakeCurrency: Currency;
  };
  balance: CoinPretty;
}> = observer(({ containerStyle, balance }) => {
  const { chainStore, tokensStore } = useStore();

  const style = useStyle();

  const tokensOf = tokensStore.getTokensOf(chainStore.current.chainId);

  const navigation = useNavigation();

  const [showConfirmModal, setConfirmModal] = useState(false);

  // The IBC currency could have long denom (with the origin chain/channel information).
  // Because it is shown in the title, there is no need to show such long denom twice in the actual balance.

  return (
    <BlurBackground
      borderRadius={12}
      blurIntensity={14}
      containerStyle={
        [
          style.flatten([
            "padding-x-18",
            "padding-y-20",
            "margin-y-6",
            "flex-row",
            "items-center",
          ]),
          containerStyle,
        ] as ViewStyle
      }
    >
      <Text
        style={
          style.flatten(["subtitle3", "color-white", "uppercase"]) as ViewStyle
        }
      >
        {balance.currency.coinDenom}
      </Text>
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
          onPress={() => {
            setConfirmModal(true);

            if (tokensOf.tokens.length === 0 && navigation.canGoBack()) {
              navigation.goBack();
            }
          }}
        >
          <ConfirmCardModel
            isOpen={showConfirmModal}
            close={() => setConfirmModal(false)}
            title={"Delete token"}
            subtitle={"Are you sure you want to delete this token?"}
            select={async (confirm: boolean) => {
              if (confirm) {
                await tokensOf.removeToken(balance.currency);
              }
            }}
          />
          <TrashCanIcon
            size={28}
            color={
              style.flatten(["color-gray-100", "dark:color-platinum-300"]).color
            }
          />
        </BorderlessButton>
      </View>
    </BlurBackground>
  );
});
