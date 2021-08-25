import React, { FunctionComponent, useState } from "react";
import { registerModal } from "../base";
import { CardModal } from "../card";
import { Text, View } from "react-native";
import { useStyle } from "../../../styles";
import { useStore } from "../../../stores";
import { Button } from "../../../components/staging/button";
import { observer } from "mobx-react-lite";
import { TextInput } from "../../../components/staging/input";
import { flowResult } from "mobx";
import { WordChip } from "../../../components/staging/mnemonic";
import Clipboard from "expo-clipboard";

export const ViewPrivateInfoModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  title: string;
}> = registerModal(
  observer(({ title }) => {
    const { keyRingStore } = useStore();
    const style = useStyle();

    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isFailed, setIsFailed] = useState(false);

    const [keyRing, setKeyRing] = useState("");

    const approve = async () => {
      try {
        setIsLoading(true);

        const keyStoreIndex = keyRingStore.multiKeyStoreInfo.findIndex(
          (keyStore) => keyStore.selected
        );
        const newKeyRing = await flowResult(
          keyRingStore.showKeyRing(keyStoreIndex, password)
        );

        setKeyRing(newKeyRing);
      } catch (e) {
        console.log(e);
        setIsLoading(false);
        setIsFailed(true);
      }
    };

    const words = keyRing.split(" ");

    return (
      <CardModal title={title}>
        {keyRing ? (
          <View>
            <View style={style.flatten(["flex-row", "flex-wrap"])}>
              {words.map((word, i) => {
                return (
                  <WordChip key={i.toString()} index={i + 1} word={word} />
                );
              })}
            </View>
            <View style={style.flatten(["width-full"])}>
              <Button
                textStyle={style.flatten(["text-button1"])}
                mode="text"
                text="Copy to Clipboard"
                onPress={() => {
                  Clipboard.setString(words.join(" "));
                }}
              />
            </View>
          </View>
        ) : (
          <View>
            <Text
              style={style.flatten([
                "color-text-black-medium",
                "margin-bottom-32",
              ])}
            >
              Enter your password to continue.
            </Text>
            <View>
              <TextInput
                label="Password"
                returnKeyType="done"
                secureTextEntry={true}
                value={password}
                error={isFailed ? "Invalid password" : undefined}
                onChangeText={setPassword}
                onSubmitEditing={approve}
              />
              <Button text="Approve" loading={isLoading} onPress={approve} />
            </View>
          </View>
        )}
      </CardModal>
    );
  }),
  {
    disableSafeArea: true,
  }
);
