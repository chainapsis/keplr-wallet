import React, { FunctionComponent, useRef } from "react";
import { observer } from "mobx-react-lite";
import styled from "styled-components";
import { Box } from "../../../components/box";
import { XAxis, YAxis } from "../../../components/axis";
import { useStore } from "../../../stores";
import { Body1, Subtitle3 } from "../../../components/typography";
import { ColorPalette } from "../../../styles";
import { Gutter } from "../../../components/gutter";
import { usePaginatedCursorQuery } from "./hook";
import { ResMsgsHistory } from "./types";
import SimpleBar from "simplebar-react";
import { PaginationLimit, Relations } from "./constants";
import SimpleBarCore from "simplebar-core";
import { HeaderHeight } from "../../../layouts/header";
import { useNavigate } from "react-router";
import { TokenInfos } from "./token-info";
import { RenderMessages } from "./messages";
import { Modal } from "../../../components/modal";
import { BuyCryptoModal } from "../components";
import { useBuy } from "../../../hooks/use-buy";
import { CoinPretty, DecUtils } from "@keplr-wallet/unit";
import { CircleButton } from "./circle-button";
import { AddressChip, QRCodeChip } from "./address-chip";
import { ReceiveModal } from "./receive-modal";
import { StakedBalance } from "./staked-balance";

const Styles = {
  Container: styled.div`
    height: 100vh;

    background-color: ${ColorPalette["gray-700"]};

    display: flex;
    flex-direction: column;
  `,
  Header: styled.div`
    height: ${HeaderHeight};

    display: flex;
    flex-direction: column;
  `,
  Body: styled.div`
    height: calc(100vh - ${HeaderHeight});
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
  const {
    chainStore,
    accountStore,
    queriesStore,
    priceStore,
    skipQueriesStore,
  } = useStore();

  const chainInfo = chainStore.getChain(chainId);
  const currency = chainInfo.forceFindCurrency(coinMinimalDenom);

  const isIBCCurrency = "paths" in currency;

  const [isReceiveOpen, setIsReceiveOpen] = React.useState(false);
  const [isOpenBuy, setIsOpenBuy] = React.useState(false);

  const buySupportServiceInfos = useBuy({ chainId, currency });
  const isSomeBuySupport = buySupportServiceInfos.some(
    (serviceInfo) => !!serviceInfo.buyUrl
  );

  const balance = queriesStore
    .get(chainId)
    .queryBalances.getQueryBech32Address(
      accountStore.getAccount(chainId).bech32Address
    )
    .getBalance(currency);

  const navigate = useNavigate();

  const buttons: {
    icon: React.ReactElement;
    text: string;
    onClick: () => void;
    disabled?: boolean;
  }[] = [
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          fill="none"
          viewBox="0 0 20 20"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.556"
            d="M10 3.75v12.5M16.25 10H3.75"
          />
        </svg>
      ),
      text: "Buy",
      onClick: () => {
        setIsOpenBuy(true);
      },
      disabled: !isSomeBuySupport,
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          fill="none"
          viewBox="0 0 20 20"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.56"
            d="M16.25 3.75l-12.5 12.5m0 0h9.375m-9.375 0V6.875"
          />
        </svg>
      ),
      text: "Receive",
      onClick: () => {
        setIsReceiveOpen(true);
      },
      disabled: isIBCCurrency,
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          fill="none"
          viewBox="0 0 20 20"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.56"
            d="M6.25 17.5L2.5 13.75m0 0L6.25 10M2.5 13.75h11.25m0-11.25l3.75 3.75m0 0L13.75 10m3.75-3.75H6.25"
          />
        </svg>
      ),
      text: "Swap",
      onClick: () => {
        navigate(
          `/ibc-swap?chainId=${chainId}&coinMinimalDenom=${coinMinimalDenom}&outChainId=${
            chainStore.getChain("noble").chainId
          }&outCoinMinimalDenom=uusdc`
        );
      },
      disabled: !skipQueriesStore.queryIBCSwap.isSwappableCurrency(
        chainId,
        currency
      ),
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          fill="none"
          viewBox="0 0 20 20"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.56"
            d="M3.75 16.25l12.5-12.5m0 0H6.875m9.375 0v9.375"
          />
        </svg>
      ),
      text: "Send",
      onClick: () => {
        navigate(
          `/send?chainId=${chainId}&coinMinimalDenom=${coinMinimalDenom}`
        );
      },
    },
  ];

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
      <Styles.Header>
        <Box
          style={{
            flex: 1,
          }}
          alignY="center"
          paddingX="1.25rem"
        >
          <XAxis alignY="center">
            <Box
              style={{
                cursor: "pointer",
              }}
              onClick={(e) => {
                e.preventDefault();

                close();
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1.5rem"
                height="1.5rem"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke={ColorPalette["gray-300"]}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
            </Box>
            <div style={{ flex: 1 }} />
            <span>
              <Body1 as="span" color={ColorPalette["gray-200"]}>
                {(() => {
                  let denom = currency.coinDenom;
                  if ("originCurrency" in currency && currency.originCurrency) {
                    denom = currency.originCurrency.coinDenom;
                  }

                  return `${denom} on `;
                })()}
              </Body1>
              <Body1
                as="span"
                color={
                  isIBCCurrency
                    ? ColorPalette["white"]
                    : ColorPalette["gray-200"]
                }
              >
                {chainInfo.chainName}
              </Body1>
            </span>
            <div style={{ flex: 1 }} />
            {/* 뒤로가기 버튼과 좌우를 맞추기 위해서 존재... */}
            <Box width="1.5rem" height="1.5rem" />
          </XAxis>
        </Box>
      </Styles.Header>
      <Styles.Body>
        <SimpleBar
          ref={simpleBarRef}
          onScroll={onScroll}
          style={{
            height: "100%",
            overflowY: "auto",
          }}
        >
          {!isIBCCurrency ? (
            <React.Fragment>
              <Gutter size="0.25rem" />
              <YAxis alignX="center">
                <XAxis alignY="center">
                  <AddressChip chainId={chainId} />
                  <Gutter size="0.25rem" />
                  <QRCodeChip
                    onClick={() => {
                      setIsReceiveOpen(true);
                    }}
                  />
                </XAxis>
              </YAxis>
            </React.Fragment>
          ) : null}
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
          <Gutter size="1.25rem" />
          <YAxis alignX="center">
            <XAxis>
              <Gutter size="0.875rem" />
              {buttons.map((obj, i) => {
                return (
                  <React.Fragment key={i.toString()}>
                    <Gutter size="1.875rem" />
                    <CircleButton
                      text={obj.text}
                      icon={obj.icon}
                      onClick={obj.onClick}
                      disabled={obj.disabled}
                    />
                    {i === buttons.length - 1 ? (
                      <Gutter size="1.875rem" />
                    ) : null}
                  </React.Fragment>
                );
              })}
              <Gutter size="0.875rem" />
            </XAxis>
          </YAxis>

          {chainInfo.stakeCurrency &&
          chainInfo.stakeCurrency.coinMinimalDenom ===
            currency.coinMinimalDenom ? (
            <React.Fragment>
              <Gutter size="1.25rem" />
              <StakedBalance chainId={chainId} />
            </React.Fragment>
          ) : null}

          {(() => {
            const infos: {
              title: string;
              text: string;
            }[] = [];

            if (currency.coinGeckoId) {
              const price = priceStore.calculatePrice(
                new CoinPretty(
                  currency,
                  DecUtils.getTenExponentN(currency.coinDecimals)
                )
              );
              if (price) {
                if ("originCurrency" in currency && currency.originCurrency) {
                  infos.push({
                    title: `${currency.originCurrency.coinDenom} Price`,
                    text: price.toString(),
                  });
                } else {
                  infos.push({
                    title: `${currency.coinDenom} Price`,
                    text: price.toString(),
                  });
                }
              }
            }

            if ("paths" in currency && currency.paths.length > 0) {
              const path = currency.paths[currency.paths.length - 1];
              if (path.clientChainId) {
                const chainName = chainStore.hasChain(path.clientChainId)
                  ? chainStore.getChain(path.clientChainId).chainName
                  : path.clientChainId;
                infos.push({
                  title: "Channel",
                  text: `${chainName}/${path.channelId.replace(
                    "channel-",
                    ""
                  )}`,
                });
              }
            }

            if (infos.length === 0) {
              return null;
            }

            return (
              <React.Fragment>
                <Gutter size="1.25rem" />
                <TokenInfos title="Token Info" infos={infos} />
              </React.Fragment>
            );
          })()}

          <Gutter size="1.25rem" />
          <RenderMessages
            msgHistory={msgHistory}
            targetDenom={coinMinimalDenom}
          />
        </SimpleBar>
      </Styles.Body>

      <Modal
        isOpen={isOpenBuy}
        align="bottom"
        close={() => setIsOpenBuy(false)}
      >
        <BuyCryptoModal
          close={() => setIsOpenBuy(false)}
          buySupportServiceInfos={buySupportServiceInfos}
        />
      </Modal>

      <Modal
        isOpen={isReceiveOpen}
        align="bottom"
        close={() => setIsReceiveOpen(false)}
      >
        <ReceiveModal chainId={chainId} close={() => setIsReceiveOpen(false)} />
      </Modal>
    </Styles.Container>
  );
});
