import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { Card, CardBody } from "../../../components/staging/card";
import { Text, View } from "react-native";
import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";
import { AddressChip } from "../../../components/staging/address-chip";
import { DoubleDoughnutChart } from "../../../components/svg";
import { Button } from "../../../components/staging/button";
import { useNavigation } from "@react-navigation/native";
import { Dot } from "../../../components/staging/dot";

export const AccountCard: FunctionComponent = observer(() => {
  const { chainStore, accountStore, queriesStore, priceStore } = useStore();

  const style = useStyle();

  const navigation = useNavigation();

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
    <Card>
      <CardBody style={style.flatten(["padding-top-16"])}>
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
            </View>
          </View>
          <View style={style.flatten(["width-full", "margin-bottom-16"])}>
            <View
              style={style.flatten([
                "flex-row",
                "items-end",
                "margin-bottom-4",
              ])}
            >
              <View
                style={style.flatten(["flex-1", "flex-row", "justify-end"])}
              >
                <Dot
                  containerStyle={style.flatten(["margin-right-8"])}
                  size={6}
                  color={style.get("color-primary").color}
                />
                <Text
                  style={style.flatten([
                    "text-right",
                    "subtitle1",
                    "color-primary",
                  ])}
                >
                  Available
                </Text>
              </View>
              {/* Dummy view for the gap between elements */}
              <View style={style.flatten(["width-8"])} />
              <Text
                style={style.flatten([
                  "flex-1",
                  "subtitle2",
                  "color-text-black-medium",
                ])}
              >
                {stakable.trim(true).shrink(true).upperCase(true).toString()}
              </Text>
            </View>
            <View style={style.flatten(["flex-row", "items-end"])}>
              <View
                style={style.flatten(["flex-1", "flex-row", "justify-end"])}
              >
                <Dot
                  containerStyle={style.flatten(["margin-right-8"])}
                  size={6}
                  color={style.get("color-primary-200").color}
                />
                <Text
                  style={style.flatten([
                    "text-right",
                    "subtitle1",
                    "color-primary-200",
                  ])}
                >
                  Staked
                </Text>
              </View>
              {/* Dummy view for the gap between elements */}
              <View style={style.flatten(["width-8"])} />
              <Text
                style={style.flatten([
                  "flex-1",
                  "subtitle2",
                  "color-text-black-medium",
                ])}
              >
                {stakedSum.trim(true).shrink(true).upperCase(true).toString()}
              </Text>
            </View>
          </View>
          <View style={style.flatten(["flex-row"])}>
            <Button
              containerStyle={style.flatten(["flex-1"])}
              text="Deposit"
              mode="outline"
            />
            {/* Dummy view for the gap between elements */}
            <View style={style.flatten(["width-12"])} />
            <Button
              containerStyle={style.flatten(["flex-1"])}
              text="Send"
              onPress={() => {
                navigation.navigate("Others", {
                  screen: "Send",
                  params: {
                    initAddress: "",
                    initMemo: "",
                  },
                });
              }}
            />
          </View>
        </View>
      </CardBody>
    </Card>
  );
});
