import React, { FunctionComponent, useRef } from "react";
import { observer } from "mobx-react-lite";
import styled from "styled-components";
import { Box } from "../../../components/box";
import { XAxis, YAxis } from "../../../components/axis";
import { useStore } from "../../../stores";
import { Body1, Body3, Subtitle3 } from "../../../components/typography";
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
  const { chainStore, accountStore, queriesStore, priceStore } = useStore();

  const chainInfo = chainStore.getChain(chainId);
  const currency = chainInfo.forceFindCurrency(coinMinimalDenom);

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
  }[] = [
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="40"
          fill="none"
          viewBox="0 0 40 40"
        >
          <rect width="40" height="40" y="0.5" fill="#424247" rx="20" />
          <path
            stroke={ColorPalette["white"]}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M20 14.25v12.5m6.25-6.25h-12.5"
          />
        </svg>
      ),
      text: "Buy",
      onClick: () => {
        setIsOpenBuy(true);
      },
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="40"
          fill="none"
          viewBox="0 0 40 40"
        >
          <rect width="40" height="40" y="0.5" fill="#424247" rx="20" />
          <path
            stroke={ColorPalette["white"]}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M26.25 14.25l-12.5 12.5m0 0h9.375m-9.375 0v-9.375"
          />
        </svg>
      ),
      text: "Receive",
      onClick: () => {
        // TODO: noop yet
      },
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="40"
          fill="none"
          viewBox="0 0 40 40"
        >
          <rect width="40" height="40" y="0.5" fill="#424247" rx="20" />
          <path
            stroke={ColorPalette["white"]}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M12.5 16.75L16.25 13m0 0L20 16.75M16.25 13v11.25m11.25 0L23.75 28m0 0L20 24.25M23.75 28V16.75"
          />
        </svg>
      ),
      text: "Swap",
      onClick: () => {
        // TODO: noop yet
      },
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="40"
          fill="none"
          viewBox="0 0 40 40"
        >
          <rect width="40" height="40" y="0.5" fill="#424247" rx="20" />
          <path
            stroke={ColorPalette["white"]}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M13.75 26.75l12.5-12.5m0 0h-9.375m9.375 0v9.375"
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
          <Gutter size="1.25rem" />
          <YAxis alignX="center">
            <XAxis>
              <Gutter size="0.875rem" />
              {buttons.map((obj, i) => {
                if (obj.text === "Buy" && !isSomeBuySupport) {
                  return null;
                }

                return (
                  <React.Fragment key={i.toString()}>
                    <Gutter size="1.875rem" />
                    <Box
                      cursor="pointer"
                      onClick={(e) => {
                        e.preventDefault();

                        obj.onClick();
                      }}
                    >
                      <YAxis alignX="center">
                        {obj.icon}
                        <Gutter size="0.375rem" />
                        <Box alignX="center" width="1px">
                          <Box>
                            <Body3 color={ColorPalette["white"]}>
                              {obj.text}
                            </Body3>
                          </Box>
                        </Box>
                      </YAxis>
                    </Box>
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
          chainInfo.stakeCurrency.coinMinimalDenom === currency.coinMinimalDenom
            ? (() => {
                const queryDelegation = queriesStore
                  .get(chainId)
                  .cosmos.queryDelegations.getQueryBech32Address(
                    accountStore.getAccount(chainId).bech32Address
                  );

                return (
                  <React.Fragment>
                    <Gutter size="1.25rem" />
                    <Box paddingX="0.75rem">
                      <Box
                        backgroundColor={ColorPalette["gray-550"]}
                        borderRadius="0.375rem"
                        padding="1rem"
                      >
                        <XAxis alignY="center">
                          <Box
                            width="2rem"
                            height="2rem"
                            borderRadius="999999px"
                            backgroundColor={ColorPalette["white"]}
                          />
                          <Gutter size="0.75rem" />
                          <YAxis>
                            <Body3 color={ColorPalette["gray-200"]}>
                              Staked Balance
                            </Body3>
                            <Gutter size="0.25rem" />
                            <Subtitle3 color={ColorPalette["white"]}>
                              {queryDelegation.total
                                ? queryDelegation.total
                                    .maxDecimals(6)
                                    .shrink(true)
                                    .inequalitySymbol(true)
                                    .trim(true)
                                    .toString()
                                : "-"}
                            </Subtitle3>
                          </YAxis>
                        </XAxis>
                      </Box>
                    </Box>
                  </React.Fragment>
                );
              })()
            : null}

          {(() => {
            const price = (() => {
              if (!currency.coinGeckoId) {
                return;
              }

              return priceStore.calculatePrice(
                new CoinPretty(
                  currency,
                  DecUtils.getTenExponentN(currency.coinDecimals)
                )
              );
            })();

            if (!price) {
              return null;
            }

            return (
              <React.Fragment>
                <Gutter size="1.25rem" />
                <TokenInfos
                  title="Token Info"
                  infos={[
                    {
                      title: `${currency.coinDenom} Price`,
                      text: price.toString(),
                    },
                  ]}
                />
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
    </Styles.Container>
  );
});
