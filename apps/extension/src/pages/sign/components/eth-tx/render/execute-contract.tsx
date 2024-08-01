import React from "react";
import { IEthTxRenderer } from "../types";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../../stores";
import { Stack } from "../../../../../components/stack";
import { Body1, Body2, Subtitle4 } from "../../../../../components/typography";
import { ColorPalette } from "../../../../../styles";
import { useTheme } from "styled-components";
import { Gutter } from "../../../../../components/gutter";
import { FormattedMessage } from "react-intl";
import { Box } from "../../../../../components/box";
import { ItemLogo } from "../../../../main/token-detail/msg-items/logo";

export const EthExecuteContractTx: IEthTxRenderer = {
  process(_, unsignedTx) {
    if (
      unsignedTx.data != null &&
      unsignedTx.data !== "0x" &&
      unsignedTx.to != null
    ) {
      const contractAddress = unsignedTx.to;

      return {
        icon: (
          <ItemLogo
            center={
              <svg
                width="19"
                height="22"
                viewBox="0 0 19 22"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="1"
                  y="1"
                  width="16.6667"
                  height="20"
                  rx="2.22222"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M5 7L13 7"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M5 11L11 11"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            }
            width="2.75rem"
            height="2.75rem"
          />
        ),
        title: (
          <FormattedMessage id="page.sign.ethereum.transaction.execute-contract.title" />
        ),
        content: (
          <EthExecuteContractTxPretty
            contractAddress={contractAddress}
            txData={String(unsignedTx.data)}
          />
        ),
      };
    }
  },
};

const EthExecuteContractTxPretty: React.FunctionComponent<{
  contractAddress: string;
  txData: string;
}> = observer(({ contractAddress, txData }) => {
  const { queriesStore } = useStore();
  const theme = useTheme();

  const functionNameResult = queriesStore.simpleQuery.queryGet<{
    count: number;
    next: string | null;
    previous: string | null;
    results: (
      | {
          id: number;
          created_at: string;
          text_signature: string;
          hex_signature: string;
          bytes_signature: string;
        }
      | undefined
    )[];
  }>(
    "https://www.4byte.directory",
    `/api/v1/signatures?hex_signature=${txData.slice(0, 10)}`
  );
  // Convert the function name to Title Case
  const functionName = functionNameResult.response?.data.results[
    (functionNameResult.response?.data.results.length ?? 0) - 1
  ]?.text_signature
    .split("(")[0]
    .replace(/([-_][a-z])/g, (group) =>
      group.toUpperCase().replace("-", "").replace("_", "")
    )
    .replace(/([A-Z])/g, " $1");

  return (
    <React.Fragment>
      <Box
        padding="0.25rem 0.625rem"
        backgroundColor={ColorPalette["gray-400"]}
        borderRadius="20rem"
        width="fit-content"
      >
        <Body2 color={ColorPalette["white"]}>
          {`${contractAddress.slice(0, 10)}...${contractAddress.slice(-8)}`}{" "}
        </Body2>
      </Box>
      {functionName && (
        <React.Fragment>
          <Gutter size="1.125rem" />
          <Stack gutter="0.25rem">
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
              {functionName.charAt(0).toUpperCase() + functionName.slice(1)}
            </Body1>
          </Stack>
        </React.Fragment>
      )}
    </React.Fragment>
  );
});
