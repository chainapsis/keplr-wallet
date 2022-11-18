import React, { FunctionComponent, useEffect } from "react";
import { PageWithScrollView } from "../../components/page";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { useStyle } from "../../styles";
import { useSmartNavigation } from "../../navigation";
import { RightArrowIcon } from "../../components/icon";
import { Card } from "../../components/card";
import { RectButton } from "../../components/rect-button";
import { Currency, Secret20Currency } from "@keplr-wallet/types";
import { TokenSymbol } from "../../components/token-symbol";
import { HeaderRightButton } from "../../components/header";
import { HeaderAddIcon } from "../../components/header/icon";
import {
  ObservableQueryBalanceInner,
  WrongViewingKeyError,
} from "@keplr-wallet/stores";
import Svg, { Path } from "react-native-svg";
import { useLoadingScreen } from "../../providers/loading-screen";
import { LoadingSpinner } from "../../components/spinner";

export const AlertFillIcon: FunctionComponent<{ height: number }> = ({
  height,
}) => {
  return (
    <Svg
      viewBox="0 0 24 25"
      fill="none"
      style={{
        height,
        aspectRatio: 24 / 25,
      }}
    >
      <Path
        d="M12 2.75C6.62391 2.75 2.25 7.12391 2.25 12.5C2.25 17.8761 6.62391 22.25 12 22.25C17.3761 22.25 21.75 17.8761 21.75 12.5C21.75 7.12391 17.3761 2.75 12 2.75ZM12 17.7458C11.8146 17.7458 11.6333 17.6908 11.4792 17.5878C11.325 17.4848 11.2048 17.3384 11.1339 17.167C11.0629 16.9957 11.0443 16.8072 11.0805 16.6254C11.1167 16.4435 11.206 16.2765 11.3371 16.1454C11.4682 16.0143 11.6352 15.925 11.8171 15.8888C11.999 15.8526 12.1875 15.8712 12.3588 15.9421C12.5301 16.0131 12.6765 16.1333 12.7795 16.2874C12.8825 16.4416 12.9375 16.6229 12.9375 16.8083C12.9375 17.0569 12.8387 17.2954 12.6629 17.4712C12.4871 17.647 12.2486 17.7458 12 17.7458ZM13.0181 8.31687L12.7491 14.0356C12.7491 14.2345 12.67 14.4253 12.5294 14.566C12.3887 14.7066 12.198 14.7856 11.9991 14.7856C11.8001 14.7856 11.6094 14.7066 11.4687 14.566C11.3281 14.4253 11.2491 14.2345 11.2491 14.0356L10.98 8.31969V8.31734C10.9741 8.17997 10.9961 8.04282 11.0446 7.91415C11.0931 7.78549 11.1671 7.66797 11.2622 7.56868C11.3574 7.46938 11.4716 7.39037 11.5981 7.33639C11.7245 7.28241 11.8606 7.25458 11.9981 7.25458C12.1356 7.25458 12.2717 7.28241 12.3982 7.33639C12.5246 7.39037 12.6389 7.46938 12.734 7.56868C12.8291 7.66797 12.9032 7.78549 12.9517 7.91415C13.0002 8.04282 13.0221 8.17997 13.0162 8.31734L13.0181 8.31687Z"
        fill="#F0224B"
      />
    </Svg>
  );
};

export const TokensScreen: FunctionComponent = observer(() => {
  const { chainStore, queriesStore, accountStore } = useStore();

  const style = useStyle();

  const queryBalances = queriesStore
    .get(chainStore.current.chainId)
    .queryBalances.getQueryBech32Address(
      accountStore.getAccount(chainStore.current.chainId).bech32Address
    );

  const tokens = queryBalances.positiveNativeUnstakables
    .concat(queryBalances.nonNativeBalances)
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

  const smartNavigation = useSmartNavigation();

  const showAddTokenButton = (() => {
    if (!chainStore.current.features) {
      return false;
    }

    if (chainStore.current.features.includes("cosmwasm")) {
      return true;
    }
  })();

  useEffect(() => {
    if (showAddTokenButton) {
      smartNavigation.setOptions({
        // eslint-disable-next-line react/display-name
        headerRight: () => (
          <HeaderRightButton
            onPress={() => {
              smartNavigation.navigateSmart("Setting.AddToken", {});
            }}
          >
            <HeaderAddIcon />
          </HeaderRightButton>
        ),
      });
    } else {
      smartNavigation.setOptions({
        headerRight: undefined,
      });
    }
  }, [showAddTokenButton, smartNavigation]);

  return (
    <PageWithScrollView backgroundMode="gradient">
      {tokens.length > 0 ? (
        <Card style={style.flatten(["padding-bottom-14"])}>
          {tokens.map((token) => {
            return (
              <TokenItem
                key={token.currency.coinMinimalDenom}
                chainInfo={chainStore.current}
                balance={token}
              />
            );
          })}
        </Card>
      ) : null}
    </PageWithScrollView>
  );
});

export const TokenItem: FunctionComponent<{
  containerStyle?: ViewStyle;

  chainInfo: {
    stakeCurrency: Currency;
  };
  balance: ObservableQueryBalanceInner;
}> = observer(({ containerStyle, chainInfo, balance }) => {
  const style = useStyle();

  const { chainStore, accountStore, tokensStore } = useStore();

  const loadingScreen = useLoadingScreen();
  const smartNavigation = useSmartNavigation();

  const error = balance.error;
  const currency = balance.currency;

  // The IBC currency could have long denom (with the origin chain/channel information).
  // Because it is shown in the title, there is no need to show such long denom twice in the actual balance.
  const balanceCoinDenom = (() => {
    if ("originCurrency" in currency && currency.originCurrency) {
      return currency.originCurrency.coinDenom;
    }
    return currency.coinDenom;
  })();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const createViewingKey = async (): Promise<string | undefined> => {
    if ("type" in currency && currency.type === "secret20") {
      const contractAddress = currency.contractAddress;
      return new Promise((resolve) => {
        account.secret
          .createSecret20ViewingKey(
            contractAddress,
            "",
            {},
            {},
            (_, viewingKey) => {
              loadingScreen.setIsLoading(false);

              resolve(viewingKey);
            }
          )
          .then(() => loadingScreen.setIsLoading(true));
      });
    }
  };

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
      onPress={async () => {
        if (error?.data && error.data instanceof WrongViewingKeyError) {
          const viewingKey = await createViewingKey();

          if (viewingKey) {
            const tokenOf = tokensStore.getTokensOf(chainStore.current.chainId);

            tokenOf.addToken({
              ...currency,
              viewingKey,
            } as Secret20Currency);
          }
        } else {
          smartNavigation.navigateSmart("Send", {
            currency: currency.coinMinimalDenom,
          });
        }
      }}
    >
      <TokenSymbol
        style={style.flatten(["margin-right-12"])}
        size={44}
        chainInfo={chainInfo}
        currency={currency}
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
          {currency.coinDenom}
        </Text>
        <View style={style.flatten(["flex-row", "items-center"])}>
          <Text
            style={style.flatten(["h5", "color-text-high", "max-width-240"])}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {`${balance.balance
              .trim(true)
              .shrink(true)
              .maxDecimals(6)
              .upperCase(true)
              .hideDenom(true)
              .toString()} ${balanceCoinDenom}`}
          </Text>
          {balance.isFetching ? (
            <View
              style={style.flatten([
                "height-16",
                "justify-center",
                "margin-left-8",
              ])}
            >
              <LoadingSpinner
                size={14}
                color={style.get("color-loading-spinner").color}
              />
            </View>
          ) : null}
        </View>
      </View>
      <View style={style.get("flex-1")} />
      {error?.data && error.data instanceof WrongViewingKeyError ? (
        <View style={style.flatten(["margin-right-16"])}>
          <AlertFillIcon height={24} />
        </View>
      ) : null}
      <RightArrowIcon
        height={16}
        color={
          style.flatten(["color-gray-200", "dark:color-platinum-300"]).color
        }
      />
    </RectButton>
  );
});
