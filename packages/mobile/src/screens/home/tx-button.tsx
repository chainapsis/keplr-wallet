import React, { FunctionComponent } from "react";

import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { Button, useTheme } from "react-native-elements";
import { View } from "react-native";
import { Dec } from "@keplr-wallet/unit";
import { useNavigation } from "@react-navigation/native";

export const TxButtonView: FunctionComponent = observer(() => {
  const { accountStore, chainStore, queriesStore } = useStore();

  const navigate = useNavigation();

  const accountInfo = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);
  const queryBalances = queries
    .getQueryBalances()
    .getQueryBech32Address(accountInfo.bech32Address);

  const hasAssets =
    queryBalances.balances.find((bal) => bal.balance.toDec().gt(new Dec(0))) !==
    undefined;

  const { theme } = useTheme();

  return (
    <View style={{ flexDirection: "row" }}>
      <Button
        containerStyle={{ flex: 1, marginRight: 10 }}
        buttonStyle={{
          borderWidth: 1,
          borderColor: theme.colors?.primary,
          borderRadius: 5,
          backgroundColor: theme.colors?.white,
          paddingVertical: 10,
          paddingHorizontal: 20,
        }}
        titleStyle={{
          color: theme.colors?.primary,
          fontWeight: "500",
        }}
        title="Deposit"
        onPress={() => {}}
      />
      {/*
        "Disabled" property in button tag will block the mouse enter/leave events.
        So, tooltip will not work as expected.
        To solve this problem, don't add "disabled" property to button tag and just add "disabled" class manually.
       */}
      <Button
        containerStyle={{
          flex: 1,
          marginLeft: 10,
        }}
        buttonStyle={{
          borderWidth: 1,
          borderColor: theme.colors?.primary,
          borderRadius: 5,
          backgroundColor: theme.colors?.white,
          paddingVertical: 10,
          paddingHorizontal: 20,
        }}
        titleStyle={{
          color: theme.colors?.primary,
          fontWeight: "500",
        }}
        title="Send"
        disabled={!hasAssets}
        loading={accountInfo.isSendingMsg === "send"}
        onPress={() => {
          if (hasAssets) {
            navigate.navigate("Send");
          }
        }}
      />
    </View>
  );
});
