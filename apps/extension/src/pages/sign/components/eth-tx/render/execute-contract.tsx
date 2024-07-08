import React from "react";
import { IEthTxRenderer } from "../types";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../../stores";
import { Image } from "../../../../../components/image";
import { Stack } from "../../../../../components/stack";
import { Body1, Subtitle4 } from "../../../../../components/typography";
import { ColorPalette } from "../../../../../styles";
import { useTheme } from "styled-components";
import { Gutter } from "../../../../../components/gutter";
import { FormattedMessage } from "react-intl";

export const EthExecuteContractTx: IEthTxRenderer = {
  process(_, unsignedTx) {
    if (unsignedTx.data != null && unsignedTx.to != null) {
      const contractAddress = unsignedTx.to;

      return {
        icon: (
          <Image
            alt="sign-execute-contract-image"
            src={require("../../../../../public/assets/img/sign-execute-contract.png")}
            style={{ width: "3rem", height: "3rem" }}
          />
        ),
        title: (
          <FormattedMessage id="page.sign.ethereum.transaction.execute-contract.title" />
        ),
        content: (
          <EthExecuteContractTxTitlePretty
            contractAddress={contractAddress}
            txData={String(unsignedTx.data)}
          />
        ),
      };
    }
  },
};

const EthExecuteContractTxTitlePretty: React.FunctionComponent<{
  contractAddress: string;
  txData: string;
}> = observer(({ contractAddress, txData }) => {
  const { queriesStore } = useStore();
  const theme = useTheme();

  const functionNameResult = queriesStore.simpleQuery.queryGet<{
    count: number;
    next: string | null;
    previous: string | null;
    results: {
      id: number;
      created_at: string;
      text_signature: string;
      hex_signature: string;
      bytes_signature: string;
    }[];
  }>(
    "https://www.4byte.directory",
    `/api/v1/signatures?hex_signature=${txData.slice(0, 10)}`
  );
  const functionName =
    functionNameResult.response?.data.results[0].text_signature.split("(")[0];

  return (
    <React.Fragment>
      <b>{`${contractAddress.slice(0, 12)}...${contractAddress.slice(-10)}`}</b>
      <Gutter size="1.125rem" />
      {functionNameResult.response?.data && (
        <Stack gutter="2px">
          <Subtitle4
            color={
              theme.mode === "light"
                ? ColorPalette["gray-400"]
                : ColorPalette["gray-200"]
            }
          >
            <FormattedMessage id="page.sign.ethereum.transaction.execute-contract.function" />
          </Subtitle4>
          <Body1
            color={
              theme.mode === "light"
                ? ColorPalette["gray-500"]
                : ColorPalette["white"]
            }
          >
            {functionName
              ? functionName?.charAt(0).toUpperCase() + functionName?.slice(1)
              : "Unknown"}
          </Body1>
        </Stack>
      )}
    </React.Fragment>
  );
});
