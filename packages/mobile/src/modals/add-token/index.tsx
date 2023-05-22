import React, { FunctionComponent } from "react";
import { registerModal } from "../base";
import { CardModal } from "../card";
import { useStore } from "../../stores";
import { observer } from "mobx-react-lite";
import { TextInput } from "../../components/input";
import { Button } from "../../components/button";
import { useStyle } from "../../styles";
import { View } from "react-native";

export const AddTokenModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
}> = registerModal(
  observer(() => {
    const { chainStore, queriesStore, tokensStore } = useStore();

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
