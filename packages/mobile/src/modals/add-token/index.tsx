import React, { FunctionComponent, useState } from "react";
import { registerModal } from "../base";
import { CardModal } from "../card";
import { useStore } from "../../stores";
import { observer } from "mobx-react-lite";
import { TextInput } from "../../components/input";
import { Button } from "../../components/button";
import { useStyle } from "../../styles";
import { StyleSheet, View } from "react-native";
import { DownArrowIcon, UpArrowIcon } from "../../components/icon";

export const AddTokenModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
}> = registerModal(
  observer(() => {
    const { chainStore, queriesStore, tokensStore } = useStore();

    const [isAdvanced, setAdvanced] = useState(false);
    const [viewingKey, setViewingKey] = useState(
      tokensStore.waitingSuggestedToken?.data?.viewingKey ?? ""
    );

    const style = useStyle();

    const chainId =
      tokensStore.waitingSuggestedToken?.data.chainId ||
      chainStore.current.chainId;
    const contractAddress =
      tokensStore.waitingSuggestedToken?.data.contractAddress || "";

    const isSecret20 =
      (chainStore.current.features ?? []).find(
        (feature) => feature === "secretwasm"
      ) != null;

    const queries = queriesStore.get(chainId);

    const query = isSecret20
      ? queries.secret.querySecret20ContractInfo
      : queries.cosmwasm.querycw20ContractInfo;

    const queryContractInfo = query.getQueryContract(contractAddress);
    const tokenInfo = queryContractInfo.tokenInfo;

    return (
      <CardModal title="Add Token">
        <TextInput
          label="Contract Address"
          value={contractAddress}
          editable={false}
        />
        <TextInput
          label="Name"
          editable={false}
          value={tokenInfo?.name ?? ""}
        />
        <TextInput
          label="Symbol"
          editable={false}
          value={tokenInfo?.symbol ?? ""}
        />
        <TextInput
          label="Decimals"
          editable={false}
          value={tokenInfo?.decimals.toString() ?? ""}
        />
        {isSecret20 ? (
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
        ) : null}
        {isAdvanced ? (
          <TextInput
            label="Viewing key"
            placeholder="Import my own viewing key"
            value={viewingKey}
            onChangeText={setViewingKey}
          />
        ) : null}
        <View style={style.flatten(["height-16"])} />
        <Button
          text="Submit"
          size="large"
          disabled={!tokenInfo || queryContractInfo.error != null}
          loading={!tokenInfo && queryContractInfo.isFetching}
          onPress={async () => {
            if (tokenInfo) {
              await tokensStore.approveSuggestedToken({
                type: "cw20",
                contractAddress,
                coinMinimalDenom: tokenInfo.name,
                coinDenom: tokenInfo.symbol,
                coinDecimals: tokenInfo.decimals,
              });
            }
          }}
        />
      </CardModal>
    );
  }),
  {
    disableSafeArea: true,
  }
);
