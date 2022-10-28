import React, { FunctionComponent, useState } from "react";
import { PageWithScrollView } from "../../../../components/page";
import { useStyle } from "../../../../styles";
import { RouteProp, useRoute } from "@react-navigation/native";
import {
  AddressBookConfig,
  useMemoConfig,
  useRecipientConfig,
} from "@keplr-wallet/hooks";
import { observer } from "mobx-react-lite";
import { View } from "react-native";
import { useStore } from "../../../../stores";
import { EthereumEndpoint } from "../../../../config";
import {
  AddressInput,
  MemoInput,
  TextInput,
} from "../../../../components/input";
import { Button } from "../../../../components/button";
import { useSmartNavigation } from "../../../../navigation";

export const AddAddressBookScreen: FunctionComponent = observer(() => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          chainId: string;
          addressBookConfig: AddressBookConfig;
        }
      >,
      string
    >
  >();

  const { chainStore } = useStore();

  const smartNavigation = useSmartNavigation();
  const addressBookConfig = route.params.addressBookConfig;

  const style = useStyle();

  const [name, setName] = useState("");
  const recipientConfig = useRecipientConfig(chainStore, route.params.chainId, {
    ensEndpoint: EthereumEndpoint,
    allowHexAddressOnEthermint: true,
  });
  const memoConfig = useMemoConfig(chainStore, route.params.chainId);

  return (
    <PageWithScrollView
      backgroundMode="tertiary"
      contentContainerStyle={style.get("flex-grow-1")}
      style={style.flatten(["padding-x-page"])}
    >
      <View style={style.flatten(["height-page-pad"])} />
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
            memoConfig.error == null
          ) {
            await addressBookConfig.addAddressBook({
              name,
              address: recipientConfig.rawRecipient,
              memo: memoConfig.memo,
            });

            smartNavigation.goBack();
          }
        }}
      />
      <View style={style.flatten(["height-page-pad"])} />
    </PageWithScrollView>
  );
});
