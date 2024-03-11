import React, { FunctionComponent, useRef } from "react";
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
import SimpleBar from "simplebar-react";
import { PaginationLimit, Relations } from "./constants";
import SimpleBarCore from "simplebar-core";

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
      }?relations=${Relations.join(",")}&denoms=${encodeURIComponent(
        currency.coinMinimalDenom
      )}&vsCurrencies=${priceStore.defaultVsCurrency}&limit=${PaginationLimit}`;
    },
    (_, prev) => {
      return {
        cursor: prev.nextCursor,
      };
    },
    (res) => {
      if (!res.nextCursor) {
        return true;
      }
      return false;
    }
  );

  const simpleBarRef = useRef<SimpleBarCore>(null);
  // scroll to refresh
  const onScroll = () => {
    const el = simpleBarRef.current?.getContentElement();
    const scrollEl = simpleBarRef.current?.getScrollElement();
    if (el && scrollEl) {
      const rect = el.getBoundingClientRect();
      const scrollRect = scrollEl.getBoundingClientRect();

      const remainingBottomY =
        rect.y + rect.height - scrollRect.y - scrollRect.height;

      if (remainingBottomY < scrollRect.height / 10) {
        msgHistory.next();
      }
    }
  };

  return (
    <Styles.Container>
      <SimpleBar
        ref={simpleBarRef}
        onScroll={onScroll}
        style={{
          height: "100%",
          overflowY: "auto",
        }}
      >
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
            {(() => {
              if (
                msgHistory.pages.length === 0 ||
                !msgHistory.pages[0].response
              ) {
                return null;
              }

              const allMsgs: ResMsgsHistory["msgs"][0][] = [];
              for (const page of msgHistory.pages) {
                if (page.response) {
                  for (const msg of page.response.msgs) {
                    allMsgs.push(msg);
                  }
                }
              }

              return allMsgs.map((msg) => {
                return (
                  <MsgItemRender
                    key={`${msg.msg.height}/${msg.msg.msgIndex}/${msg.msg.relation}`}
                    msg={msg.msg}
                    prices={msg.prices}
                    targetDenom={coinMinimalDenom}
                  />
                );
              });
            })()}
          </Stack>
        </Box>
      </SimpleBar>
    </Styles.Container>
  );
});
