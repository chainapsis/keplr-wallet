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

export const EditAccountNameScreen: FunctionComponent = observer(() => {
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
  const recipientConfig = useRecipientConfig(chainStore, route.params.chainId, {
    allowHexAddressOnEthermint: true,
  });
  const memoConfig = useMemoConfig(chainStore, route.params.chainId);

  const addressIndex = addressBookConfig.addressBookDatas.findIndex(
    (element) => element.address === recipientConfig.recipient
  );

  useEffect(() => {
    if (index >= 0) {
      const data = addressBookConfig.addressBookDatas[index];
      setName(data.name);
      recipientConfig.setRawRecipient(data.address);
      memoConfig.setMemo(data.memo);
    }
  }, [addressBookConfig.addressBookDatas, index, memoConfig, recipientConfig]);

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
        disabled={
          !name || recipientConfig.error != null || memoConfig.error != null
        }
        onPress={async () => {
          if (
            name &&
            recipientConfig.error == null &&
            memoConfig.error == null &&
            addressIndex == index
          ) {
            addressBookConfig.editAddressBookAt(index, {
              name: name.trim(),
              address: recipientConfig.recipient,
              memo: memoConfig.memo,
            });
            recipientConfig.setRawRecipient("");
            memoConfig.setMemo("");
            smartNavigation.goBack();
          }
        }}
      />
      <View style={style.flatten(["height-page-pad"]) as ViewStyle} />
    </PageWithScrollView>
  );
});
