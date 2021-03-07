import React, { FunctionComponent, useState } from "react";
import {
  Content,
  Text,
  Textarea,
  Button,
  Form,
  Item,
  Label,
  Input,
} from "native-base";
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
    <Content padder>
      <Form>
        <Item floatingLabel>
          <Label>Name</Label>
          <Input value={name} onChangeText={setName} />
        </Item>
        <Item floatingLabel>
          <Label>Password</Label>
          <Input value={password} onChangeText={setPassword} />
        </Item>
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
            console.log(name, password);
            await registerConfig.createMnemonic(name, mnemonic, password, {
              account: 0,
              change: 0,
              addressIndex: 0,
            });

            // TODO: Remove this!!
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            accountStore.getAccount(chainId).init();

            navigation.dispatch(StackActions.replace("Main"));
          }}
        >
          <Text>Create</Text>
        </Button>
      </Form>
    </Content>
  );
});
