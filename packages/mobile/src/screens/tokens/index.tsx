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

export const ToolIcon: FunctionComponent<{ height: number }> = ({ height }) => {
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
        d="M22.0097 6.14939C21.9557 6.04435 21.8776 5.95356 21.7819 5.8844C21.6862 5.81523 21.5754 5.76966 21.4587 5.75138C21.3421 5.73311 21.2227 5.74265 21.1104 5.77923C20.9981 5.81581 20.896 5.87839 20.8125 5.96189L17.9325 8.84376C17.7911 8.98309 17.6006 9.06119 17.4021 9.06119C17.2036 9.06119 17.0131 8.98309 16.8717 8.84376L15.6267 7.59689C15.5571 7.52724 15.5018 7.44455 15.4641 7.35355C15.4264 7.26254 15.407 7.165 15.407 7.0665C15.407 6.96799 15.4264 6.87045 15.4641 6.77945C15.5018 6.68844 15.5571 6.60575 15.6267 6.53611L18.4945 3.66783C18.5805 3.58187 18.6443 3.4763 18.6804 3.36021C18.7165 3.24413 18.7239 3.121 18.7018 3.00144C18.6798 2.88189 18.629 2.76948 18.5538 2.67391C18.4787 2.57834 18.3814 2.50247 18.2705 2.45283C16.1044 1.48439 13.4006 1.9897 11.6958 3.68189C10.2473 5.12001 9.81563 7.3672 10.5122 9.84735C10.5497 9.97961 10.55 10.1197 10.5128 10.2521C10.4757 10.3844 10.4026 10.5039 10.3017 10.5974L2.49797 17.7247C2.19396 17.9977 1.94874 18.3297 1.77728 18.7005C1.60581 19.0714 1.5117 19.4733 1.50067 19.8817C1.48964 20.2901 1.56193 20.6965 1.71313 21.0761C1.86434 21.4556 2.09128 21.8004 2.38012 22.0894C2.66896 22.3783 3.01364 22.6054 3.39313 22.7568C3.77263 22.9082 4.17898 22.9806 4.58741 22.9698C4.99583 22.9589 5.39777 22.865 5.76869 22.6937C6.13962 22.5224 6.47175 22.2773 6.74485 21.9734L13.9486 14.1524C14.0407 14.0528 14.1582 13.9802 14.2884 13.9424C14.4187 13.9047 14.5568 13.9032 14.6878 13.9381C15.3939 14.1316 16.1223 14.232 16.8544 14.2367C18.42 14.2367 19.7939 13.73 20.7848 12.7536C22.62 10.9456 22.8998 7.87907 22.0097 6.14939ZM4.66313 21.4602C4.35441 21.4939 4.04284 21.4309 3.77142 21.28C3.50001 21.1291 3.28212 20.8976 3.14784 20.6176C3.01356 20.3376 2.9695 20.0228 3.02174 19.7167C3.07399 19.4105 3.21996 19.1282 3.43952 18.9085C3.65907 18.6889 3.94139 18.5428 4.24749 18.4905C4.5536 18.4381 4.86841 18.4821 5.14848 18.6163C5.42855 18.7504 5.66007 18.9683 5.81108 19.2396C5.96209 19.511 6.02515 19.8225 5.99157 20.1313C5.95461 20.4709 5.80278 20.7878 5.56121 21.0295C5.31964 21.2711 5.0028 21.4231 4.66313 21.4602Z"
        fill="#C6C6CD"
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
          <ToolIcon height={24} />
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
