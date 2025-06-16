import React from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../../stores";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { erc20ContractInterface } from "@keplr-wallet/stores-eth";
import { IEthTxRenderer } from "../types";
import { ItemLogo } from "../../../../main/token-detail/msg-items/logo";
import { ColorPalette } from "../../../../../styles";
import { Box } from "../../../../../components/box";
import { Body1, Body2, Subtitle4 } from "../../../../../components/typography";
import { Gutter } from "../../../../../components/gutter";
import { Columns } from "../../../../../components/column";
import { Stack } from "../../../../../components/stack";
import { useTheme } from "styled-components";
import { FormattedMessage } from "react-intl";

export const EthSendTokenTx: IEthTxRenderer = {
  process(chainId, unsignedTx) {
    if (unsignedTx.data && unsignedTx.data !== "0x" && unsignedTx.to) {
      try {
        const dataDecodedValues = erc20ContractInterface.decodeFunctionData(
          "transfer",
          unsignedTx.data
        );
        const erc20ContractAddress = unsignedTx.to;
        const recipient = dataDecodedValues[0];
        const amount = dataDecodedValues[1];

        if (
          !erc20ContractAddress ||
          typeof erc20ContractAddress !== "string" ||
          !recipient ||
          typeof recipient !== "string" ||
          !amount ||
          (typeof amount !== "string" &&
            typeof amount !== "number" &&
            typeof amount !== "bigint")
        ) {
          return undefined;
        }

        return {
          icon: (
            <ItemLogo
              center={
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 22 22"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4.125 17.875L17.875 4.125M17.875 4.125L7.5625 4.125M17.875 4.125V14.4375"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              }
              width="2.75rem"
              height="2.75rem"
            />
          ),
          title: (
            <FormattedMessage id="page.sign.ethereum.transaction.send.title" />
          ),
          content: (
            <EthSendTokenTxPretty
              chainId={chainId}
              recipient={recipient}
              amount={amount.toString()}
              erc20ContractAddress={erc20ContractAddress}
            />
          ),
        };
      } catch (e) {
        // Fallback to other renderers if unsingedTx.data can't be decoded with ERC20 transfer method.
        return undefined;
      }
    } else {
      const recipient = unsignedTx.to;
      const amount = unsignedTx.value;

      if (
        !recipient ||
        typeof recipient !== "string" ||
        !amount ||
        (typeof amount !== "string" &&
          typeof amount !== "number" &&
          typeof amount !== "bigint")
      ) {
        return undefined;
      }

      return {
        icon: (
          <ItemLogo
            center={
              <svg
                width="22"
                height="22"
                viewBox="0 0 22 22"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4.125 17.875L17.875 4.125M17.875 4.125L7.5625 4.125M17.875 4.125V14.4375"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
            width="2.75rem"
            height="2.75rem"
          />
        ),
        title: (
          <FormattedMessage id="page.sign.ethereum.transaction.send.title" />
        ),
        content: (
          <EthSendTokenTxPretty
            chainId={chainId}
            recipient={recipient}
            amount={amount.toString()}
          />
        ),
      };
    }
  },
};

export const EthSendTokenTxPretty: React.FunctionComponent<{
  chainId: string;
  recipient: string;
  amount: string;
  erc20ContractAddress?: string;
}> = observer(({ chainId, recipient, amount, erc20ContractAddress }) => {
  const { chainStore, accountStore } = useStore();
  const chainInfo = chainStore.getChain(chainId);
  const sender = accountStore.getAccount(chainId).ethereumHexAddress;

  const currency = erc20ContractAddress
    ? chainInfo.forceFindCurrency(`erc20:${erc20ContractAddress}`)
    : chainInfo.currencies[0];
  const amountCoinPretty = new CoinPretty(currency, new Dec(Number(amount)));

  const theme = useTheme();

  return (
    <React.Fragment>
      <Box
        padding="0.25rem 0.625rem"
        backgroundColor={ColorPalette["gray-400"]}
        borderRadius="20rem"
        width="fit-content"
      >
        <Body2 color={ColorPalette["white"]}>
          {amountCoinPretty.trim(true).toString()}
        </Body2>
      </Box>

      <Gutter size="0.75rem" />

      <Columns sum={1} gutter="1.125rem" alignY="center">
        <Stack alignX="center" gutter="0.375rem">
          <Box
            backgroundColor={ColorPalette["gray-300"]}
            borderRadius="20rem"
            width="0.5rem"
            height="0.5rem"
          />
          <Box
            backgroundColor={ColorPalette["gray-300"]}
            width="1px"
            height="3rem"
          />
          <Box
            backgroundColor={ColorPalette["gray-300"]}
            borderRadius="20rem"
            width="0.5rem"
            height="0.5rem"
          />
        </Stack>
        <Stack gutter="1.625rem">
          <Stack gutter="0.25rem">
            <Subtitle4
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-400"]
                  : ColorPalette["gray-200"]
              }
            >
              <FormattedMessage id="page.sign.ethereum.transaction.send.from" />
            </Subtitle4>
            <Body1
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-500"]
                  : ColorPalette["white"]
              }
            >{`${sender.slice(0, 10)}...${sender.slice(-8)}`}</Body1>
          </Stack>
          <Stack gutter="0.25rem">
            <Subtitle4
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-400"]
                  : ColorPalette["gray-200"]
              }
            >
              <FormattedMessage id="page.sign.ethereum.transaction.send.to" />
            </Subtitle4>
            <Body1
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-500"]
                  : ColorPalette["white"]
              }
            >{`${recipient.slice(0, 10)}...${recipient.slice(-8)}`}</Body1>
          </Stack>
        </Stack>
      </Columns>
    </React.Fragment>
  );
});
