import React, { FunctionComponent, useState } from "react";
import { Button, Input } from "react-native-elements";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { useRegisterConfig } from "@keplr-wallet/hooks";
import { getRandomBytesAsync } from "../../common";
import { useNavigation, StackActions } from "@react-navigation/native";

export const RegisterScreen: FunctionComponent = observer(() => {
  const navigation = useNavigation();

  const chainId = "secret-2";
  const { keyRingStore, accountStore } = useStore();

  const registerConfig = useRegisterConfig(
    keyRingStore,
    [],
    getRandomBytesAsync
  );

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [mnemonic, setMnemonic] = useState("");

  return (
    <React.Fragment>
      <Input label="Name" value={name} onChangeText={setName} />
      <Input
        label="Password"
        autoCompleteType="password"
        secureTextEntry={true}
        value={password}
        onChangeText={setPassword}
      />
      <Input
        label="Mnemonic"
        autoCapitalize="none"
        value={mnemonic}
        onChangeText={setMnemonic}
        multiline={true}
        numberOfLines={5}
      />
      <Button
        title="Create"
        onPress={async () => {
          await registerConfig.createMnemonic(name, mnemonic, password, {
            account: 0,
            change: 0,
            addressIndex: 0,
          });

          // TODO: Remove this!!
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          accountStore.getAccount(chainId).init();

          navigation.dispatch(StackActions.replace("Home"));
        }}
      />
    </React.Fragment>
  );
});
