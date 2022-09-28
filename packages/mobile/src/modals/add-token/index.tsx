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

    const queryTokenInfo = queriesStore
      .get(chainId)
      .cosmwasm.querycw20ContractInfo.getQueryContract(contractAddress);

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
        <View style={style.flatten(["height-16"])} />
        <Button
          text="Submit"
          size="large"
          disabled={!queryTokenInfo.tokenInfo || queryTokenInfo.error != null}
          loading={!queryTokenInfo.tokenInfo && queryTokenInfo.isFetching}
          onPress={async () => {
            if (queryTokenInfo.tokenInfo) {
              await tokensStore.approveSuggestedToken({
                type: "cw20",
                contractAddress,
                coinMinimalDenom: queryTokenInfo.tokenInfo.name,
                coinDenom: queryTokenInfo.tokenInfo.symbol,
                coinDecimals: queryTokenInfo.tokenInfo.decimals,
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
