import React, { FunctionComponent, useEffect, useState } from "react";
import { PageWithScrollView } from "components/page";
import { observer } from "mobx-react-lite";
import { useStore } from "stores/index";
import { useStyle } from "styles/index";
import { InputCardView } from "components/new/card-view/input-card";
import { Button } from "components/button";
import { KeyboardSpacerView } from "components/keyboard";
import { MultiKeyStoreInfoWithSelectedElem } from "@keplr-wallet/background";
import { View, ViewStyle } from "react-native";
import {
  NavigationProp,
  ParamListBase,
  useNavigation,
} from "@react-navigation/native";

export const RenameWalletScreen: FunctionComponent = observer(() => {
  const { keyRingStore, accountStore, chainStore } = useStore();
  const style = useStyle();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  const [newName, setNewName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInvalidName, setIsInvalidName] = useState(false);
  const [selectedKeyStore, setSelectedKeyStore] =
    useState<MultiKeyStoreInfoWithSelectedElem>();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const waitingNameData = keyRingStore.waitingNameData?.data;

  const isReadOnly =
    waitingNameData !== undefined && !waitingNameData?.editable;

  useEffect(() => {
    keyRingStore.multiKeyStoreInfo.map((keyStore) => {
      if (keyStore.meta?.["name"] === account.name) {
        setSelectedKeyStore(keyStore);
      }
    });
  }, []);

  const onEnterName = async (name: string) => {
    try {
      const selectedIndex = keyRingStore.multiKeyStoreInfo.findIndex(
        (keyStore) => keyStore == selectedKeyStore
      );

      await keyRingStore.updateNameKeyRing(selectedIndex, name.trim());
      setSelectedKeyStore(undefined);
    } catch (e) {
      console.log("Fail to decrypt: " + e.message);
    }
  };

  const submitNewName = async () => {
    if (newName.length == 0) {
      setIsInvalidName(true);
      return;
    }

    setIsLoading(true);
    try {
      await onEnterName(newName);
      setIsInvalidName(false);
      setNewName("");
      navigation.goBack();
    } catch (e) {
      console.log(e);
      setIsInvalidName(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageWithScrollView
      backgroundMode="image"
      contentContainerStyle={style.get("flex-grow-1")}
      style={style.flatten(["padding-x-page", "padding-y-page"]) as ViewStyle}
    >
      <InputCardView
        label="wallet name"
        value={account.name}
        editable={false}
        inputStyle={style.flatten(["color-gray-300"])}
      />
      <InputCardView
        label="New wallet name"
        onChangeText={(text: string) => {
          if (!isReadOnly) setNewName(text);
        }}
        value={newName}
        maxLength={30}
        error={isInvalidName ? "Name is required" : undefined}
        returnKeyType="done"
        onSubmitEditing={submitNewName}
      />
      <View style={style.get("flex-1")} />
      <Button
        text="Save"
        size="large"
        containerStyle={style.flatten(["border-radius-32"]) as ViewStyle}
        loading={isLoading}
        onPress={submitNewName}
        disabled={!newName}
      />
      <KeyboardSpacerView />
    </PageWithScrollView>
  );
});
