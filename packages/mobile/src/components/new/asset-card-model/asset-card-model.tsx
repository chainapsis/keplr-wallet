import React, { FunctionComponent, useEffect, useState } from "react";
import { CardModal } from "modals/card";
import { View, ViewStyle } from "react-native";
import { useStyle } from "styles/index";
import { BlurBackground } from "components/new/blur-background/blur-background";
import { observer } from "mobx-react-lite";
import { TextInput } from "components/input";
import { SearchIcon } from "components/new/icon/search-icon";
import { IAmountConfig } from "@keplr-wallet/hooks";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useStore } from "stores/index";
import { CoinPretty, Int } from "@keplr-wallet/unit";
import { TokenCardView } from "../card-view/token-card-view";
import { EmptyView } from "../empty";

export const AssetCardModel: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  title: string;
  amountConfig: IAmountConfig;
}> = observer(({ close, title, isOpen, amountConfig }) => {
  const safeAreaInsets = useSafeAreaInsets();
  const style = useStyle();

  const { queriesStore, priceStore } = useStore();
  const [search, setSearch] = useState("");
  const queryBalances = queriesStore
    .get(amountConfig.chainId)
    .queryBalances.getQueryBech32Address(amountConfig.sender);

  const selectableCurrencies = amountConfig.sendableCurrencies
    .filter((cur) => {
      const bal = queryBalances.getBalanceFromCurrency(cur);
      return !bal.toDec().isZero();
    })
    .sort((a, b) => {
      return a.coinDenom < b.coinDenom ? -1 : 1;
    });

  const [filterCurrencies, setFilterCurrencies] =
    useState(selectableCurrencies);
  // console.log(selectableCurrencies);

  useEffect(() => {
    const searchTrim = search.trim();
    const newSelectableCurrencies = selectableCurrencies.filter((curr) => {
      return curr.coinDenom.toLowerCase().includes(searchTrim.toLowerCase());
    });
    setFilterCurrencies(newSelectableCurrencies);
  }, [search]);

  const convertToUsd = (currency: any) => {
    const value = priceStore.calculatePrice(currency);
    const inUsd = value && value.shrink(true).maxDecimals(6).toString();
    return inUsd;
  };
  const balancesMap = new Map(
    queryBalances.balances.map((bal) => [
      bal.currency.coinMinimalDenom,
      bal.balance,
    ])
  );

  if (!isOpen) {
    return null;
  }

  return (
    <CardModal
      isOpen={isOpen}
      title={title}
      disableGesture={true}
      close={() => {
        setSearch("");
        close();
      }}
      cardStyle={
        [
          style.flatten(["height-full", "border-radius-0"]) as ViewStyle,
          {
            // paddingTop: Platform.OS === "ios" ? safeAreaInsets.top : 48,
            // height: filterCurrencies.length === 0 ? "100%" : undefined,
          },
        ] as ViewStyle
      }
      childrenContainerStyle={{
        height: filterCurrencies.length === 0 ? "100%" : undefined,
      }}
    >
      {filterCurrencies.length === 0 ? (
        <EmptyView
          containerStyle={style.flatten(["margin-left-20"]) as ViewStyle}
        />
      ) : null}
      <BlurBackground
        borderRadius={12}
        blurIntensity={20}
        containerStyle={style.flatten(["margin-y-10"]) as ViewStyle}
      >
        <TextInput
          placeholder="Search"
          placeholderTextColor={"white"}
          style={style.flatten(["h6"])}
          inputContainerStyle={
            style.flatten([
              "border-width-0",
              "padding-x-18",
              "padding-y-12",
            ]) as ViewStyle
          }
          onChangeText={(text) => {
            setSearch(text);
          }}
          containerStyle={style.flatten(["padding-0"]) as ViewStyle}
          inputRight={<SearchIcon />}
        />
      </BlurBackground>
      <View style={style.flatten(["margin-y-24"]) as ViewStyle}>
        {filterCurrencies.map((currency) => {
          const currencyBalance =
            balancesMap.get(currency.coinMinimalDenom) ||
            new CoinPretty(currency, new Int(0));
          return (
            <TokenCardView
              key={currency.coinMinimalDenom}
              title={currency.coinDenom}
              subtitle={`${currencyBalance
                .shrink(true)
                .maxDecimals(6)
                .toString()}`}
              trailingStart={
                convertToUsd(currencyBalance)
                  ? `${convertToUsd(currencyBalance)}`
                  : ""
              }
              trailingEnd={convertToUsd(currencyBalance) ? "USD" : ""}
              containerStyle={
                style.flatten(
                  ["margin-y-4"],
                  [
                    currency.coinMinimalDenom ===
                      amountConfig.sendCurrency.coinMinimalDenom &&
                      "background-color-indigo",
                  ]
                ) as ViewStyle
              }
              onPress={() => {
                amountConfig.setSendCurrency(currency);
                setSearch("");
                close();
              }}
            />
          );
        })}
      </View>
    </CardModal>
  );
});
