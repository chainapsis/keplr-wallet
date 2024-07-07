import React from "react";
import { ItemLogo } from "../../../../main/token-detail/msg-items/logo";
import { IEthTxRenderer } from "../types";
import { ColorPalette } from "../../../../../styles";
import { Body1, Body2, Subtitle4 } from "../../../../../components/typography";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../../stores";
import { Stack } from "../../../../../components/stack";
import { useTheme } from "styled-components";
import { Gutter } from "../../../../../components/gutter";

export const EthExecuteContractTx: IEthTxRenderer = {
  process(_, unsignedTx) {
    if (unsignedTx.data != null && unsignedTx.to != null) {
      const contractAddress = unsignedTx.to;

      return {
        icon: (
          <ItemLogo
            center={
              <svg
                width="44"
                height="44"
                viewBox="0 0 44 44"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="44" height="44" rx="22" fill="#2E2E32" />
                <path
                  d="M13.875 30.125L30.125 13.875M30.125 13.875L17.9375 13.875M30.125 13.875V26.0625"
                  stroke="#FEFEFE"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
          />
        ),
        title: "Execute Contract",
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

  const result = queriesStore.simpleQuery.queryGet<{
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
    result.response?.data.results[0].text_signature.split("(")[0];

  return (
    <React.Fragment>
      <Gutter size="0.5rem" />

      <Stack gutter="0.75rem">
        <Stack gutter="0.25rem">
          <Subtitle4
            color={
              theme.mode === "light"
                ? ColorPalette["gray-400"]
                : ColorPalette["gray-200"]
            }
          >
            Contract Address
          </Subtitle4>
          <Body2
            color={
              theme.mode === "light"
                ? ColorPalette["gray-500"]
                : ColorPalette["white"]
            }
          >{`${contractAddress.slice(0, 10)}...${contractAddress.slice(
            -8
          )}`}</Body2>
        </Stack>
        <Stack gutter="0.25rem">
          <Subtitle4
            color={
              theme.mode === "light"
                ? ColorPalette["gray-400"]
                : ColorPalette["gray-200"]
            }
          >
            Function
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
      </Stack>
    </React.Fragment>
  );
});
