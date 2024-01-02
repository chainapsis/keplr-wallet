import React, { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import { Card, CardBody } from "../../components/card";
import { Image, StyleSheet, Text, View, ViewStyle } from "react-native";
import { useStore } from "../../stores";
import { useStyle } from "../../styles";
import { AddressCopyable } from "../../components/address-copyable";
import { Button } from "../../components/button";
import { LoadingSpinner } from "../../components/spinner";
import { StakedTokenSymbol, TokenSymbol } from "../../components/token-symbol";
import { useSmartNavigation } from "../../navigation";
import { NetworkErrorView } from "./network-error-view";
import { Dec } from "@keplr-wallet/unit";
import { DoubleDoughnutChart } from "../../components/svg";
import { AddressQRCodeModal } from "../camera";
import { useNetInfo } from "@react-native-community/netinfo";

export const AccountCard: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
  const { chainStore, accountStore, queriesStore, priceStore } = useStore();
  const [isAddressQRCodeModalOpen, setIsAddressQRCodeModalOpen] =
    useState(false);

  const style = useStyle();

  const smartNavigation = useSmartNavigation();
  const netInfo = useNetInfo();
  const networkIsConnected =
    typeof netInfo.isConnected !== "boolean" || netInfo.isConnected;

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const queryStakable = queries.queryBalances.getQueryBech32Address(
    account.bech32Address
  ).stakable;
  const stakable = queryStakable.balance;

  const queryDelegated = queries.cosmos.queryDelegations.getQueryBech32Address(
    account.bech32Address
  );
  const delegated = queryDelegated.total;

  const queryUnbonding =
    queries.cosmos.queryUnbondingDelegations.getQueryBech32Address(
      account.bech32Address
    );
  const unbonding = queryUnbonding.total;

  const stakedSum = delegated.add(unbonding);

  const total = stakable.add(stakedSum);

  const totalPrice = priceStore.calculatePrice(total);

  // In the `Double Doughnut Chart` component, if data is undefined, nothing is displayed.
  // And,  if the data is [0, 0], a gray ring is displayed behind it.
  // However, data should be [0, 0] initially because no data is loaded at first.
  // But as a design decision, we should start with no gray ring behind it.
  // Therefore, in order not to display the gray ring behind it initially (from unloaded data),
  // when the balance response is not loaded, it is treated as undefined.
  const data: [number, number] | undefined = queryStakable.response
    ? [
        parseFloat(stakable.toDec().toString()),
        parseFloat(stakedSum.toDec().toString()),
      ]
    : [0, 0];

  const showBuyButton = () => {
    return false; //["fetchhub-4"].includes(chainStore.current.chainId);
  };

  return (
    <Card style={containerStyle}>
      <CardBody style={style.flatten(["padding-bottom-0"]) as ViewStyle}>
        <View
          style={
            style.flatten([
              "flex",
              "items-center",
              "margin-bottom-20",
            ]) as ViewStyle
          }
        >
          <Text
            style={
              style.flatten([
                "h4",
                "color-text-high",
                "margin-bottom-8",
              ]) as ViewStyle
            }
          >
            {account.name || "..."}
          </Text>
          <AddressCopyable address={account.bech32Address} maxCharacters={22} />
          {total.toDec().gt(new Dec(0)) ? (
            <View
              style={
                style.flatten([
                  "margin-top-28",
                  "margin-bottom-16",
                ]) as ViewStyle
              }
            >
              <DoubleDoughnutChart data={data} />
              <View
                style={style.flatten([
                  "absolute-fill",
                  "items-center",
                  "justify-center",
                ])}
              >
                <Text
                  style={
                    style.flatten([
                      "subtitle2",
                      "color-text-middle",
                      "margin-bottom-4",
                    ]) as ViewStyle
                  }
                >
                  Total Balance
                </Text>
                <Text style={style.flatten(["h3", "color-text-high"])}>
                  {totalPrice
                    ? totalPrice.toString()
                    : total.shrink(true).maxDecimals(6).toString()}
                </Text>
                {queryStakable.isFetching ? (
                  <View
                    style={StyleSheet.flatten([
                      style.flatten(["absolute"]),
                      {
                        bottom: 33,
                      },
                    ])}
                  >
                    <LoadingSpinner
                      color={style.get("color-loading-spinner").color}
                      size={22}
                    />
                  </View>
                ) : null}
              </View>
            </View>
          ) : (
            <View>
              <View style={style.flatten(["margin-30"]) as ViewStyle}>
                <Text
                  style={style.flatten([
                    "h4",
                    "color-text-highest",
                    "text-center",
                  ])}
                >
                  No funds added
                </Text>
              </View>
              <View style={style.flatten(["items-center", "justify-center"])}>
                <Image
                  style={{ height: 150, width: 150 }}
                  source={require("../../assets/image/wallet.png")}
                />
              </View>
              <View style={style.flatten(["margin-20"]) as ViewStyle}>
                <Text
                  style={style.flatten([
                    "color-text-high@50%",
                    "subtitle2",
                    "text-center",
                  ])}
                >
                  That’s okay, you can deposit tokens to your address or buy
                  some.
                </Text>
              </View>
              <View style={style.flatten(["margin-top-20"]) as ViewStyle}>
                <Button
                  text="Deposit"
                  size="large"
                  onPress={() => setIsAddressQRCodeModalOpen(true)}
                />
              </View>
              {showBuyButton() ? (
                <View style={style.flatten(["margin-top-20"]) as ViewStyle}>
                  <Button
                    text="Buy"
                    size="large"
                    disabled={!networkIsConnected}
                    onPress={() => smartNavigation.pushSmart("Fetchhub", {})}
                  />
                </View>
              ) : null}
            </View>
          )}
        </View>
      </CardBody>
      <NetworkErrorView />
      {total.toDec().gt(new Dec(0)) ? (
        <CardBody style={style.flatten(["padding-top-16"]) as ViewStyle}>
          <View style={style.flatten(["flex", "items-center"]) as ViewStyle}>
            <View
              style={
                style.flatten([
                  "flex-row",
                  "items-center",
                  "margin-bottom-28",
                ]) as ViewStyle
              }
            >
              <TokenSymbol
                size={44}
                chainInfo={chainStore.current}
                currency={chainStore.current.stakeCurrency}
              />
              <View style={style.flatten(["margin-left-12"]) as ViewStyle}>
                <Text
                  style={
                    style.flatten([
                      "subtitle3",
                      "color-blue-400",
                      "dark:color-platinum-200",
                      "margin-bottom-4",
                    ]) as ViewStyle
                  }
                >
                  Available
                </Text>
                <Text style={style.flatten(["h5", "color-text-high"])}>
                  {stakable.maxDecimals(6).trim(true).shrink(true).toString()}
                </Text>
              </View>
              <View style={style.flatten(["flex-1"])} />
              <Button
                text="Send"
                size="small"
                containerStyle={style.flatten(["min-width-72"]) as ViewStyle}
                disabled={
                  !networkIsConnected || stakable.toDec().lte(new Dec(0))
                }
                onPress={() => {
                  smartNavigation.navigateSmart("Send", {
                    currency: chainStore.current.stakeCurrency.coinMinimalDenom,
                  });
                }}
              />
            </View>
            <View
              style={
                style.flatten([
                  "flex-row",
                  "items-center",
                  "margin-bottom-8",
                ]) as ViewStyle
              }
            >
              <StakedTokenSymbol size={44} />
              <View style={style.flatten(["margin-left-12"]) as ViewStyle}>
                <Text
                  style={
                    style.flatten([
                      "subtitle3",
                      "color-staking",
                      "dark:color-platinum-200",
                      "margin-bottom-4",
                    ]) as ViewStyle
                  }
                >
                  Staking
                </Text>
                <Text style={style.flatten(["h5", "color-text-high"])}>
                  {stakedSum.maxDecimals(6).trim(true).shrink(true).toString()}
                </Text>
              </View>
              <View style={style.flatten(["flex-1"])} />
              <Button
                text="Stake"
                mode="light"
                size="small"
                containerStyle={style.flatten(["min-width-72"]) as ViewStyle}
                disabled={
                  !networkIsConnected || stakable.toDec().lte(new Dec(0))
                }
                onPress={() => {
                  smartNavigation.navigateSmart("Validator.List", {});
                }}
              />
            </View>
          </View>
        </CardBody>
      ) : null}
      <AddressQRCodeModal
        isOpen={isAddressQRCodeModalOpen}
        close={() => setIsAddressQRCodeModalOpen(false)}
        chainId={chainStore.current.chainId}
      />
    </Card>
  );
});
