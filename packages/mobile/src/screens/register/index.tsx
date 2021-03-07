import React, { FunctionComponent, useState } from "react";
import { Content, Text, Textarea, Button } from "native-base";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { useRegisterConfig } from "@keplr-wallet/hooks";
import { getRandomBytesAsync } from "../../common";
import { useNavigation, StackActions } from "@react-navigation/native";

export const RegisterScreen: FunctionComponent = observer(() => {
  const navigation = useNavigation();

  const chainId = "secret-2";
  const { chainStore, keyRingStore, accountStore } = useStore();

  const registerConfig = useRegisterConfig(
    keyRingStore,
    [],
    getRandomBytesAsync
  );

  const [mnemonic, setMnemonic] = useState("");

  return (
    <Content padder>
      <Text>{chainStore.getChain(chainId).chainId}</Text>
      <Text>{keyRingStore.status.toString()}</Text>
      <Textarea
        autoCapitalize="none"
        value={mnemonic}
        onChangeText={setMnemonic}
        rowSpan={5}
        bordered
        placeholder="Mnemonic"
      />
      <Button
        onPress={async () => {
          await registerConfig.createMnemonic("test", mnemonic, "test", {
            account: 0,
            change: 0,
            addressIndex: 0,
          });

          // TODO: Remove this!!
          // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
          // @ts-ignore
          accountStore.getAccount(chainId).init();

          navigation.dispatch(StackActions.replace("Main"));
        }}
      >
        <Text>Create</Text>
      </Button>
    </Content>
  );
});
