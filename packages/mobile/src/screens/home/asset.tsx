import React, { FunctionComponent, useMemo } from "react";

import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { View } from "react-native";
import { Text, Badge, useTheme } from "react-native-elements";
import { DoughnutChart } from "../../components/svg";

export const AssetView: FunctionComponent = observer(() => {
  const { chainStore, accountStore, queriesStore, priceStore } = useStore();

  const current = chainStore.current;

  const queries = queriesStore.get(current.chainId);

  const accountInfo = accountStore.getAccount(current.chainId);

  const balanceStakableQuery = queries
    .getQueryBalances()
    .getQueryBech32Address(accountInfo.bech32Address).stakable;

  const stakable = balanceStakableQuery.balance;

  const delegated = queries
    .getQueryDelegations()
    .getQueryBech32Address(accountInfo.bech32Address)
    .total.upperCase(true);

  const unbonding = queries
    .getQueryUnbondingDelegations()
    .getQueryBech32Address(accountInfo.bech32Address)
    .total.upperCase(true);

  const stakedSum = delegated.add(unbonding);

  const total = stakable.add(stakedSum);

  const fiatCurrency = "usd";

  const stakablePrice = priceStore.calculatePrice(fiatCurrency, stakable);
  const stakedSumPrice = priceStore.calculatePrice(fiatCurrency, stakedSum);

  const totalPrice = priceStore.calculatePrice(fiatCurrency, total);

  // If fiat value is fetched, show the value that is multiplied with amount and fiat value.
  // If not, just show the amount of asset.
  const data: number[] = [
    stakablePrice
      ? parseFloat(stakablePrice.toDec().toString())
      : parseFloat(stakable.toDec().toString()),
    stakedSumPrice
      ? parseFloat(stakedSumPrice.toDec().toString())
      : parseFloat(stakedSum.toDec().toString()),
  ];

  const { theme } = useTheme();

  return (
    <View style={{ paddingVertical: 15 }}>
      <View style={{ position: "relative", alignItems: "center" }}>
        <DoughnutChart data={data} />
        <View
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text h4>Total Balance</Text>
          <Text h2>
            {totalPrice
              ? totalPrice.toString()
              : total.shrink(true).maxDecimals(6).toString()}
          </Text>
        </View>
      </View>
      <View style={{ marginTop: 15 }}>
        <View style={{ flexDirection: "row" }}>
          <View
            style={{
              flex: 1,
              flexDirection: "row-reverse",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                textAlign: "right",
                fontSize: 18,
                color: theme.colors?.primary,
                marginLeft: 7,
                marginRight: 7,
              }}
            >
              Available
            </Text>
            <Badge />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: "600", marginLeft: 7 }}>
              {stakable.locale(false).toString()}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: "row" }}>
          <View
            style={{
              flex: 1,
              flexDirection: "row-reverse",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                textAlign: "right",
                fontSize: 18,
                color: theme.colors?.secondary,
                marginLeft: 7,
                marginRight: 7,
              }}
            >
              Staked
            </Text>
            <Badge badgeStyle={{ backgroundColor: theme.colors?.secondary }} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: "600", marginLeft: 7 }}>
              {stakedSum.locale(false).toString()}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
});
