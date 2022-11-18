import React, { FunctionComponent, useState } from "react";
import { PageWithScrollView } from "../../../../components/page";
import { StyleSheet, View } from "react-native";
import { useStyle } from "../../../../styles";
import { Button } from "../../../../components/button";
import { AddressInput, TextInput } from "../../../../components/input";
import { observer } from "mobx-react-lite";
import { useRecipientConfig } from "@keplr-wallet/hooks";
import { useStore } from "../../../../stores";
import { useNavigation } from "@react-navigation/native";
import { DownArrowIcon, UpArrowIcon } from "../../../../components/icon";
import { useLoadingScreen } from "../../../../providers/loading-screen";
import { AppCurrency } from "@keplr-wallet/types";

export const SettingAddTokenScreen: FunctionComponent = observer(() => {
  const { chainStore, accountStore, queriesStore, tokensStore } = useStore();

  const account = accountStore.getAccount(chainStore.current.chainId);

  const [isAdvanced, setAdvanced] = useState(false);
  const [viewingKey, setViewingKey] = useState("");

  const navigation = useNavigation();
  const loadingScreen = useLoadingScreen();

  const style = useStyle();

  const recipientConfig = useRecipientConfig(
    chainStore,
    chainStore.current.chainId
  );

  const isSecret20 =
    (chainStore.current.features ?? []).find(
      (feature) => feature === "secretwasm"
    ) != null;

  const queries = queriesStore.get(chainStore.current.chainId);

  const query = isSecret20
    ? queries.secret.querySecret20ContractInfo
    : queries.cosmwasm.querycw20ContractInfo;

  const queryContractInfo = query.getQueryContract(recipientConfig.recipient);
  const queryTokenInfo = queryContractInfo.tokenInfo;
  const tokensOf = tokensStore.getTokensOf(chainStore.current.chainId);

  const createViewingKey = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      account.secret
        .createSecret20ViewingKey(
          recipientConfig.recipient,
          "",
          {},
          {},
          (_, viewingKey) => {
            loadingScreen.setIsLoading(false);

            resolve(viewingKey);
          }
        )
        .then(() => loadingScreen.setIsLoading(true))
        .catch(reject);
    });
  };

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
        value={queryTokenInfo?.name ?? ""}
      />
      <TextInput
        label="Symbol"
        editable={false}
        value={queryTokenInfo?.symbol ?? ""}
      />
      <TextInput
        label="Decimals"
        editable={false}
        value={queryTokenInfo?.decimals.toString() ?? ""}
      />
      <View
        style={StyleSheet.flatten([
          style.flatten(["flex-row", "justify-center"]),
        ])}
      >
        <Button
          text="Advanced"
          mode="text"
          rightIcon={
            <View style={style.flatten(["padding-left-4"])}>
              {isAdvanced ? (
                <UpArrowIcon size={16} color="#314FDF" />
              ) : (
                <DownArrowIcon size={16} color="#314FDF" />
              )}
            </View>
          }
          style={StyleSheet.flatten([
            style.flatten(["width-122", "items-center"]),
          ])}
          onPress={() => {
            setAdvanced(!isAdvanced);
          }}
        />
      </View>
      {isAdvanced ? (
        <TextInput
          label="Viewing key"
          placeholder="Import my own viewing key"
          value={viewingKey}
          onChangeText={setViewingKey}
        />
      ) : null}
      <View style={style.get("flex-1")} />
      <Button
        text="Submit"
        size="large"
        disabled={!queryContractInfo || queryContractInfo.error != null}
        loading={!queryTokenInfo && queryContractInfo.isFetching}
        onPress={async () => {
          if (queryTokenInfo) {
            if (
              queryTokenInfo?.decimals != null &&
              queryTokenInfo.name &&
              queryTokenInfo.symbol
            ) {
              let currency: AppCurrency;

              if (isSecret20) {
                let newViewingKey = viewingKey;

                if (!viewingKey && !isAdvanced) {
                  newViewingKey = await createViewingKey();
                }

                currency = {
                  type: "secret20",
                  contractAddress: recipientConfig.recipient,
                  viewingKey: newViewingKey,
                  coinMinimalDenom: queryTokenInfo.name,
                  coinDenom: queryTokenInfo.symbol,
                  coinDecimals: queryTokenInfo.decimals,
                };
              } else {
                currency = {
                  type: "cw20",
                  contractAddress: recipientConfig.recipient,
                  coinMinimalDenom: queryTokenInfo.name,
                  coinDenom: queryTokenInfo.symbol,
                  coinDecimals: queryTokenInfo.decimals,
                };
              }

              await tokensOf.addToken(currency);

              if (navigation.canGoBack()) {
                navigation.goBack();
              }
            }
          }
        }}
      />
      <View style={style.flatten(["height-page-pad"])} />
    </PageWithScrollView>
  );
});
