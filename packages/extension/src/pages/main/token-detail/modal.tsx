import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import styled from "styled-components";
import { HeaderHeight } from "../../../layouts/header";
import { Box } from "../../../components/box";
import { XAxis, YAxis } from "../../../components/axis";
import { useStore } from "../../../stores";
import { Body1, Subtitle3 } from "../../../components/typography";
import { ColorPalette } from "../../../styles";
import { Gutter } from "../../../components/gutter";
import { usePaginatedCursorQuery } from "./hook";
import { ResMsgsHistory } from "./types";
import { Stack } from "../../../components/stack";
import { MsgItemRender } from "./msg-items";

const Styles = {
  Container: styled.div`
    height: calc(100vh - ${HeaderHeight});

    background-color: ${ColorPalette["gray-700"]};

    border-top-style: solid;
    border-top-width: 1px;
    border-top-color: ${ColorPalette["gray-500"]};

    display: flex;
    flex-direction: column;
  `,
  Balance: styled.div`
    font-weight: 500;
    font-size: 1.75rem;
    line-height: 2.125rem;
  `,
};

export const TokenDetailModal: FunctionComponent<{
  close: () => void;
  chainId: string;
  coinMinimalDenom: string;
}> = observer(({ close, chainId, coinMinimalDenom }) => {
  const { chainStore, accountStore, queriesStore, priceStore } = useStore();

  const chainInfo = chainStore.getChain(chainId);
  const currency = chainInfo.forceFindCurrency(coinMinimalDenom);

  const balance = queriesStore
    .get(chainId)
    .queryBalances.getQueryBech32Address(
      accountStore.getAccount(chainId).bech32Address
    )
    .getBalance(currency);

  const msgHistory = usePaginatedCursorQuery<ResMsgsHistory>(
    process.env["KEPLR_EXT_TX_HISTORY_BASE_URL"],
    () => {
      return `/history/msgs/${chainInfo.chainIdentifier}/${
        accountStore.getAccount(chainId).bech32Address
      }?relations=send,ibc-receive&denoms=${encodeURIComponent(
        currency.coinMinimalDenom
      )}&vsCurrencies=${priceStore.defaultVsCurrency}`;
    }
  );

  return (
    <Styles.Container>
      <Box
        height="3.75rem"
        onClick={(e) => {
          e.preventDefault();

          close();
        }}
        alignY="center"
      >
        <XAxis alignY="center">
          <div style={{ flex: 1 }} />
          <Body1 color={ColorPalette["gray-200"]}>
            {(() => {
              let denom = currency.coinDenom;
              if ("originCurrency" in currency && currency.originCurrency) {
                denom = currency.originCurrency.coinDenom;
              }

              return `${denom} on ${chainInfo.chainName}`;
            })()}
          </Body1>
          <div style={{ flex: 1 }} />
        </XAxis>
      </Box>

      <Gutter size="0.25rem" />
      <div>TODO: Address chip</div>

      <Gutter size="1.375rem" />
      <YAxis alignX="center">
        <Styles.Balance
          style={{
            color: ColorPalette["gray-10"],
          }}
        >
          {(() => {
            if (!balance) {
              return `0 ${currency.coinDenom}`;
            }

            return balance.balance
              .maxDecimals(6)
              .inequalitySymbol(true)
              .shrink(true)
              .hideIBCMetadata(true)
              .toString();
          })()}
        </Styles.Balance>
        <Gutter size="0.25rem" />
        <Subtitle3 color={ColorPalette["gray-300"]}>
          {(() => {
            if (!balance) {
              return "-";
            }
            const price = priceStore.calculatePrice(balance.balance);
            if (price) {
              return price.toString();
            }
            return "-";
          })()}
        </Subtitle3>
      </YAxis>

      <Gutter size="1.375rem" />
      <Box padding="0.75rem">
        <Stack gutter="0.5rem">
          {msgHistory.pages[0].response
            ? msgHistory.pages[0].response.msgs.map((msg) => {
                return (
                  <MsgItemRender
                    key={`${msg.msg.height}/${msg.msg.msgIndex}/${msg.msg.relation}`}
                    msg={msg.msg}
                    prices={msg.prices}
                    targetDenom={coinMinimalDenom}
                  />
                );
              })
            : null}
        </Stack>
      </Box>
    </Styles.Container>
  );
});
