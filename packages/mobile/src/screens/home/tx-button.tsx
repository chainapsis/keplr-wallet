import React, { FunctionComponent } from "react";

import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { View } from "react-native";
import { Dec } from "@keplr-wallet/unit";
import { useNavigation } from "@react-navigation/native";
import { FlexButton, FlexWhiteButton } from "../..//components/buttons";
import { flexDirectionRow, ml3 } from "../../styles";

export const TxButtonView: FunctionComponent = observer(() => {
  const {
    accountStore,
    chainStore,
    queriesStore,
    interactionModalStore,
  } = useStore();

  const navigation = useNavigation();

  const accountInfo = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);
  const queryBalances = queries.queryBalances.getQueryBech32Address(
    accountInfo.bech32Address
  );

  const hasAssets =
    queryBalances.balances.find((bal) => bal.balance.toDec().gt(new Dec(0))) !==
    undefined;

  return (
    <View style={flexDirectionRow}>
      <FlexWhiteButton
        title="Deposit"
        onPress={() => {
          interactionModalStore.pushUrl("/dialog");
        }}
      />
      {/*
        "Disabled" property in button tag will block the mouse enter/leave events.
        So, tooltip will not work as expected.
        To solve this problem, don't add "disabled" property to button tag and just add "disabled" class manually.
       */}
      <FlexButton
        containerStyle={[ml3]}
        title="Send"
        disabled={!hasAssets}
        loading={accountInfo.isSendingMsg === "send"}
        onPress={() => {
          if (hasAssets) {
            navigation.navigate("Send", { initAddress: "", initMemo: "" });
          }
        }}
      />
    </View>
  );
});
