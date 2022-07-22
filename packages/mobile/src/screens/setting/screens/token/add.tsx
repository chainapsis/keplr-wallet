import React, { FunctionComponent } from "react";
import { PageWithScrollView } from "../../../../components/page";
import { View } from "react-native";
import { useStyle } from "../../../../styles";
import { Button } from "../../../../components/button";
import { AddressInput, TextInput } from "../../../../components/input";
import { observer } from "mobx-react-lite";
import { useRecipientConfig } from "@keplr-wallet/hooks";
import { useStore } from "../../../../stores";
import { useNavigation } from "@react-navigation/native";

export const SettingAddTokenScreen: FunctionComponent = observer(() => {
  const { chainStore, queriesStore, tokensStore } = useStore();

  const navigation = useNavigation();

  const style = useStyle();

  const recipientConfig = useRecipientConfig(
    chainStore,
    chainStore.current.chainId
  );

  const queryTokenInfo = queriesStore
    .get(chainStore.current.chainId)
    .cosmwasm.querycw20ContractInfo.getQueryContract(recipientConfig.recipient);

  return (
    <PageWithScrollView
      backgroundMode="tertiary"
      contentContainerStyle={style.get("flex-grow-1")}
      style={style.flatten(["padding-x-page"])}
    >
      <View style={style.flatten(["height-page-pad"])} />
      <AddressInput
        label="Contract Address"
        recipientConfig={recipientConfig}
        disableAddressBook={true}
      />
      <TextInput
        label="Name"
        editable={false}
        value={queryTokenInfo.tokenInfo?.name ?? ""}
      />
      <TextInput
        label="Symbol"
        editable={false}
        value={queryTokenInfo.tokenInfo?.symbol ?? ""}
      />
      <TextInput
        label="Decimals"
        editable={false}
        value={queryTokenInfo.tokenInfo?.decimals.toString() ?? ""}
      />
      <View style={style.get("flex-1")} />
      <Button
        text="Submit"
        size="large"
        disabled={!queryTokenInfo.tokenInfo || queryTokenInfo.error != null}
        loading={!queryTokenInfo.tokenInfo && queryTokenInfo.isFetching}
        onPress={async () => {
          if (queryTokenInfo.tokenInfo) {
            await tokensStore.getTokensOf(chainStore.current.chainId).addToken({
              type: "cw20",
              contractAddress: recipientConfig.recipient,
              coinMinimalDenom: queryTokenInfo.tokenInfo.name,
              coinDenom: queryTokenInfo.tokenInfo.symbol,
              coinDecimals: queryTokenInfo.tokenInfo.decimals,
            });

            if (navigation.canGoBack()) {
              navigation.goBack();
            }
          }
        }}
      />
      <View style={style.flatten(["height-page-pad"])} />
    </PageWithScrollView>
  );
});
