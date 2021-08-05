import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { Card, CardBody } from "../../../components/staging/card";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";
import { AddressChip } from "../../../components/staging/address-chip";
import { DoubleDoughnutChart } from "../../../components/svg";
import { Button } from "../../../components/staging/button";
import { LoadingSpinner } from "../../../components/staging/spinner";
import {
  StakedTokenSymbol,
  TokenSymbol,
} from "../../../components/staging/token-symbol";
import { useSmartNavigation } from "../../../navigation";

export const AccountCard: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
  const { chainStore, accountStore, queriesStore, priceStore } = useStore();

  const style = useStyle();

  const smartNavigation = useSmartNavigation();

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

  const queryUnbonding = queries.cosmos.queryUnbondingDelegations.getQueryBech32Address(
    account.bech32Address
  );
  const unbonding = queryUnbonding.total;

  const stakedSum = delegated.add(unbonding);

  const total = stakable.add(stakedSum);

  const fiatCurrency = "usd";

  const totalPrice = priceStore.calculatePrice(fiatCurrency, total);

  const data: [number, number] = [
    parseFloat(stakable.toDec().toString()),
    parseFloat(stakedSum.toDec().toString()),
  ];

  return (
    <Card style={containerStyle}>
      <CardBody>
        <View style={style.flatten(["flex", "items-center"])}>
          <Text style={style.flatten(["h4", "margin-bottom-8"])}>
            {account.name || "..."}
          </Text>
          <AddressChip address={account.bech32Address} maxCharacters={22} />
          <View style={style.flatten(["margin-y-16"])}>
            <DoubleDoughnutChart data={data} />
            <View
              style={style.flatten([
                "absolute-fill",
                "items-center",
                "justify-center",
              ])}
            >
              <Text
                style={style.flatten([
                  "subtitle2",
                  "color-text-black-medium",
                  "margin-bottom-4",
                ])}
              >
                Total Balance
              </Text>
              <Text style={style.flatten(["h3", "color-text-black-high"])}>
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
          <View
            style={style.flatten([
              "flex-row",
              "items-center",
              "margin-bottom-24",
            ])}
          >
            <TokenSymbol
              size={40}
              currency={chainStore.current.stakeCurrency}
            />
            <View style={style.flatten(["margin-left-12"])}>
              <Text
                style={style.flatten([
                  "body3",
                  "color-primary",
                  "margin-bottom-4",
                ])}
              >
                Available
              </Text>
              <Text style={style.flatten(["h5", "color-text-black-medium"])}>
                {stakable.maxDecimals(6).trim(true).shrink(true).toString()}
              </Text>
            </View>
            <View style={style.flatten(["flex-1"])} />
            <Button
              text="Send"
              size="small"
              containerStyle={style.flatten(["min-width-80"])}
              onPress={() => {
                smartNavigation.navigateSmart("Send", {});
              }}
            />
          </View>
          <View style={style.flatten(["flex-row", "items-center"])}>
            <StakedTokenSymbol size={40} />
            <View style={style.flatten(["margin-left-12"])}>
              <Text
                style={style.flatten([
                  "body3",
                  "color-primary",
                  "margin-bottom-4",
                ])}
              >
                Staking
              </Text>
              <Text style={style.flatten(["h5", "color-text-black-medium"])}>
                {stakedSum.maxDecimals(6).trim(true).shrink(true).toString()}
              </Text>
            </View>
            <View style={style.flatten(["flex-1"])} />
            <Button
              text="Stake"
              mode="light"
              size="small"
              containerStyle={style.flatten(["min-width-80"])}
              onPress={() => {
                smartNavigation.navigateSmart("Validator.List", {});
              }}
            />
          </View>
        </View>
      </CardBody>
    </Card>
  );
});
