import React, { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../stores";
import Modal from "react-native-modal";
import { Button, Form, Input, Item, Label, Text } from "native-base";
import { View } from "react-native";

export const ModalsRenderer: FunctionComponent = observer(() => {
  const { interactionModalStore, keyRingStore } = useStore();

  const [password, setPassword] = useState("");

  return (
    <React.Fragment>
      <Modal
        isVisible={interactionModalStore.lastUrl != null}
        style={{ justifyContent: "flex-end", margin: 0 }}
      >
        <View
          style={{
            height: 200,
            backgroundColor: "#FFFFFF",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Form style={{ width: "100%" }}>
            <Item floatingLabel>
              <Label>Password</Label>
              <Input
                autoCompleteType="password"
                secureTextEntry={true}
                value={password}
                onChangeText={setPassword}
              />
            </Item>
            <Button
              onPress={async () => {
                await keyRingStore.unlock(password);
                interactionModalStore.popUrl();
              }}
            >
              <Text>Unlock</Text>
            </Button>
          </Form>
        </View>
      </Modal>
    </React.Fragment>
  );
});
