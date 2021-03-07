import React, { FunctionComponent, useState } from "react";
import { Text, TextInput, Button, View } from "react-native";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { useRegisterConfig } from "@keplr-wallet/hooks";
import { getRandomBytesAsync } from "../../common";

export const RegisterScreen: FunctionComponent = observer(() => {
  const chainId = "secret-2";
  const { chainStore, keyRingStore, accountStore, queriesStore } = useStore();

  const registerConfig = useRegisterConfig(
    keyRingStore,
    [],
    getRandomBytesAsync
  );

  const quries = queriesStore.get(chainId);

  const stakable = quries
    .getQueryBalances()
    .getQueryBech32Address(accountStore.getAccount(chainId).bech32Address)
    .stakable;

  const [mnemonic, setMnemonic] = useState("");

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>{chainStore.getChain(chainId).chainId}</Text>
      <Text>{keyRingStore.status.toString()}</Text>
      <TextInput
        style={{ height: 40, borderColor: "gray", borderWidth: 1 }}
        autoCapitalize="none"
        value={mnemonic}
        onChangeText={setMnemonic}
      />
      <Button
        onPress={async () => {
          await registerConfig.createMnemonic("test", mnemonic, "test", {
            account: 0,
            change: 0,
            addressIndex: 0,
          });

          // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
          // @ts-ignore
          accountStore.getAccount(chainId).init();
        }}
        title="Create"
        color="#841584"
        accessibilityLabel="Learn more about this purple button"
      />
      <Text>{stakable.balance.locale(false).toString()}</Text>
    </View>
  );
});
