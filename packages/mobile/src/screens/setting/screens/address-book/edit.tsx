import React, { FunctionComponent, useEffect, useState } from "react";
import { PageWithScrollView } from "../../../../components/page";
import { useStyle } from "../../../../styles";
import { RouteProp, useRoute } from "@react-navigation/native";
import {
  AddressBookConfig,
  useMemoConfig,
  useRecipientConfig,
} from "@keplr-wallet/hooks";
import { observer } from "mobx-react-lite";
import { View, ViewStyle } from "react-native";
import { useStore } from "../../../../stores";
import {
  AddressInput,
  MemoInput,
  TextInput,
} from "../../../../components/input";
import { Button } from "../../../../components/button";
import { useSmartNavigation } from "../../../../navigation";
import Toast from "react-native-toast-message";

export const EditAddressBookScreen: FunctionComponent = observer(() => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          chainId: string;
          addressBookConfig: AddressBookConfig;
          i: number;
        }
      >,
      string
    >
  >();

  const { chainStore } = useStore();

  const smartNavigation = useSmartNavigation();
  const addressBookConfig = route.params.addressBookConfig;
  const index = route.params.i;

  const style = useStyle();

  const [name, setName] = useState("");
  const [preName, setPreName] = useState("");
  const recipientConfig = useRecipientConfig(chainStore, route.params.chainId, {
    allowHexAddressOnEthermint: true,
  });
  const preRecipientConfig = useRecipientConfig(
    chainStore,
    route.params.chainId,
    {
      allowHexAddressOnEthermint: true,
    }
  );
  const memoConfig = useMemoConfig(chainStore, route.params.chainId);
  const preMemoConfig = useMemoConfig(chainStore, route.params.chainId);

  useEffect(() => {
    if (index >= 0) {
      const data = addressBookConfig.addressBookDatas[index];
      setName(data.name);
      setPreName(data.name);
      recipientConfig.setRawRecipient(data.address);
      preRecipientConfig.setRawRecipient(data.address);
      memoConfig.setMemo(data.memo);
      preMemoConfig.setMemo(data.memo);
    }
  }, [addressBookConfig.addressBookDatas, index, memoConfig, recipientConfig]);

  const checkButtonDisable = () => {
    return (
      !name ||
      recipientConfig.error != null ||
      memoConfig.error != null || // this condition ckeck to empty case and error
      (name == preName &&
        (recipientConfig.recipient == preRecipientConfig.recipient ||
        memoConfig.memo.length != 0
          ? memoConfig.memo == preMemoConfig.memo
          : false))
    ); // this condition check the new data or previous data are the same or not
  };

  return (
    <PageWithScrollView
      backgroundMode="tertiary"
      contentContainerStyle={style.get("flex-grow-1")}
      style={style.flatten(["padding-x-page"]) as ViewStyle}
    >
      <View style={style.flatten(["height-page-pad"]) as ViewStyle} />
      <TextInput
        label="Nickname"
        value={name}
        onChangeText={(text) => setName(text)}
      />
      <AddressInput
        label="Address"
        recipientConfig={recipientConfig}
        memoConfig={memoConfig}
        disableAddressBook={true}
      />
      <MemoInput label="Default memo (optional)" memoConfig={memoConfig} />
      <View style={style.flatten(["flex-1"])} />
      <Button
        text="Save"
        size="large"
        disabled={checkButtonDisable()}
        onPress={async () => {
          if (
            name &&
            recipientConfig.error == null &&
            memoConfig.error == null
          ) {
            /// return -1 if address not matched
            const addressIndex = addressBookConfig.addressBookDatas.findIndex(
              (element) => element.address === recipientConfig.recipient
            );

            if (index >= 0 && (index === addressIndex || addressIndex === -1)) {
              /// Validating edit case and address is already added in the address book
              /// [addressIndex === -1] replacing old address to unique address
              /// [index === addressIndex] if the index and address index is same that means we are dealing with unique address
              addressBookConfig.editAddressBookAt(index, {
                name: name.trim(),
                address: recipientConfig.recipient,
                memo: memoConfig.memo,
              });

              recipientConfig.setRawRecipient("");
              memoConfig.setMemo("");
              smartNavigation.goBack();
            } else {
              Toast.show({
                type: "error",
                text1: "Address is already available in the Address Book",
              });
            }
          }
        }}
      />
      <View style={style.flatten(["height-page-pad"]) as ViewStyle} />
    </PageWithScrollView>
  );
});
