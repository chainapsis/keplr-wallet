import React, { FunctionComponent, useMemo, useRef } from "react";
import { observer } from "mobx-react-lite";
import styled, { useTheme } from "styled-components";
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
import { CoinPretty, Dec, DecUtils } from "@keplr-wallet/unit";
import { CircleButton } from "./circle-button";
import { AddressChip, QRCodeChip } from "./address-chip";
import { ReceiveModal } from "./receive-modal";
import { StakedBalance } from "./staked-balance";
import { MsgItemSkeleton } from "./msg-items/skeleton";
import { Stack } from "../../../components/stack";
import { EmptyView } from "../../../components/empty-view";
import { DenomHelper } from "@keplr-wallet/common";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { EarnApyBanner } from "./banners/earn-apy-banner";
import {
  validateIsUsdcFromNoble,
  validateIsUsdnFromNoble,
} from "../../earn/utils";
import { Button } from "../../../components/button";
import { FormattedMessage } from "react-intl";
import { NOBLE_CHAIN_ID } from "../../../config.ui";

const Styles = {
  Container: styled.div`
    height: 100vh;

    background: ${({ theme }) => {
      if (theme.mode === "light") {
        return "linear-gradient(90deg, #FCFAFF 2.44%, #FBFBFF 96.83%)";
      }
      return ColorPalette["gray-700"];
    }};

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
    starknetQueriesStore,
    priceStore,
    price24HChangesStore,
    skipQueriesStore,
    uiConfigStore,
  } = useStore();

  const theme = useTheme();

  const account = accountStore.getAccount(chainId);
  const modularChainInfo = chainStore.getModularChain(chainId);
  const currency = (() => {
    if ("cosmos" in modularChainInfo) {
      return chainStore.getChain(chainId).forceFindCurrency(coinMinimalDenom);
    }
    // TODO: 일단 cosmos가 아니면 대충에기에다가 force currency 로직을 박아놓는다...
    //       나중에 이런 기능을 chain store 자체에다가 만들어야한다.
    const modularChainInfoImpl = chainStore.getModularChainInfoImpl(chainId);
    const res = modularChainInfoImpl
      .getCurrencies("starknet")
      .find((cur) => cur.coinMinimalDenom === coinMinimalDenom);
    if (res) {
      return res;
    }
    return {
      coinMinimalDenom,
      coinDenom: coinMinimalDenom,
      coinDecimals: 0,
    };
  })();
  const denomHelper = new DenomHelper(currency.coinMinimalDenom);
  const isERC20 = denomHelper.type === "erc20";
  const isMainCurrency = (() => {
    if ("cosmos" in modularChainInfo) {
      const chainInfo = chainStore.getChain(chainId);
      return (
        (chainInfo.stakeCurrency || chainInfo.currencies[0])
          .coinMinimalDenom === currency.coinMinimalDenom
      );
    }
    return false;
  })();

  const isIBCCurrency = "paths" in currency;

  const [isReceiveOpen, setIsReceiveOpen] = React.useState(false);
  const [isOpenBuy, setIsOpenBuy] = React.useState(false);

  const buySupportServiceInfos = useBuy({ chainId, currency });
  const isSomeBuySupport = buySupportServiceInfos.some(
    (serviceInfo) => !!serviceInfo.buyUrl
  );
  const balance = (() => {
    if ("cosmos" in modularChainInfo) {
      const queryBalances = queriesStore.get(chainId).queryBalances;
      return chainStore.isEvmChain(chainId) && (isMainCurrency || isERC20)
        ? queryBalances
            .getQueryEthereumHexAddress(account.ethereumHexAddress)
            .getBalance(currency)
        : queryBalances
            .getQueryBech32Address(account.bech32Address)
            .getBalance(currency);
    }
    return starknetQueriesStore
      .get(chainId)
      .queryStarknetERC20Balance.getBalance(
        chainId,
        chainStore,
        account.starknetHexAddress,
        currency.coinMinimalDenom
      );
  })();

  const price24HChange = (() => {
    if (!currency.coinGeckoId) {
      return undefined;
    }
    return price24HChangesStore.get24HChange(currency.coinGeckoId);
  })();

  const navigate = useNavigate();

  const querySupported = queriesStore.simpleQuery.queryGet<string[]>(
    process.env["KEPLR_EXT_CONFIG_SERVER"],
    "/tx-history/supports"
  );

  const isSupported: boolean = useMemo(() => {
    if ("cosmos" in modularChainInfo) {
      const chainInfo = chainStore.getChain(modularChainInfo.chainId);
      const map = new Map<string, boolean>();
      for (const chainIdentifier of querySupported.response?.data ?? []) {
        map.set(chainIdentifier, true);
      }

      return map.get(chainInfo.chainIdentifier) ?? false;
    }
    // XXX: 어차피 cosmos 기반이 아니면 backend에서 지원하지 않음...
    return false;
  }, [chainStore, modularChainInfo, querySupported.response]);

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
        if ("cosmos" in modularChainInfo) {
          navigate(
            `/send?chainId=${chainId}&coinMinimalDenom=${coinMinimalDenom}`
          );
        }
        if ("starknet" in modularChainInfo) {
          navigate(
            `/starknet/send?chainId=${chainId}&coinMinimalDenom=${coinMinimalDenom}`
          );
        }
      },
    },
  ];

  const msgHistory = usePaginatedCursorQuery<ResMsgsHistory>(
    process.env["KEPLR_EXT_TX_HISTORY_BASE_URL"],
    () => {
      return `/history/msgs/${
        ChainIdHelper.parse(chainId).identifier
      }/${(() => {
        if ("cosmos" in modularChainInfo) {
          return accountStore.getAccount(chainId).bech32Address;
        }
        return accountStore.getAccount(chainId).starknetHexAddress;
      })()}?relations=${Relations.join(",")}&denoms=${encodeURIComponent(
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
                  stroke={
                    theme.mode === "light"
                      ? ColorPalette["gray-200"]
                      : ColorPalette["gray-300"]
                  }
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
            </Box>
            <div style={{ flex: 1 }} />
            <span>
              <Body1
                as="span"
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-500"]
                    : ColorPalette["gray-200"]
                }
              >
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
                    ? theme.mode === "light"
                      ? ColorPalette["blue-400"]
                      : ColorPalette["white"]
                    : theme.mode === "light"
                    ? ColorPalette["gray-500"]
                    : ColorPalette["gray-200"]
                }
              >
                {modularChainInfo.chainName}
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
                color:
                  theme.mode === "light"
                    ? ColorPalette["black"]
                    : ColorPalette["gray-10"],
              }}
            >
              {uiConfigStore.hideStringIfPrivacyMode(
                balance
                  ? balance.balance
                      .maxDecimals(6)
                      .inequalitySymbol(true)
                      .shrink(true)
                      .hideIBCMetadata(true)
                      .toString()
                  : `0 ${currency.coinDenom}`,
                4
              )}
            </Styles.Balance>
            <Gutter size="0.25rem" />
            <Subtitle3 color={ColorPalette["gray-300"]}>
              {uiConfigStore.hideStringIfPrivacyMode(
                balance
                  ? (() => {
                      const price = priceStore.calculatePrice(balance.balance);
                      return price ? price.toString() : "-";
                    })()
                  : "-",
                2
              )}
            </Subtitle3>
          </YAxis>

          {validateIsUsdnFromNoble(currency, chainId) ? (
            <Box padding="1.25rem 0.75rem 1.25rem 0.75rem">
              <Button
                text={
                  <FormattedMessage id="page.token-detail.manage-earn-button" />
                }
                color="secondary"
                size="medium"
                onClick={() => {
                  navigate(`/earn/overview?chainId=${chainId}`);
                }}
              />
            </Box>
          ) : null}

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

          {(() => {
            if ("cosmos" in modularChainInfo) {
              const chainInfo = chainStore.getChain(chainId);

              if (validateIsUsdcFromNoble(currency, chainId)) {
                return <EarnApyBanner chainId={NOBLE_CHAIN_ID} />;
              }

              if (
                chainInfo.stakeCurrency &&
                chainInfo.stakeCurrency.coinMinimalDenom ===
                  currency.coinMinimalDenom
              ) {
                return (
                  <React.Fragment>
                    <Gutter size="1.25rem" />
                    <StakedBalance modularChainInfo={modularChainInfo} />
                  </React.Fragment>
                );
              }
            } else if ("starknet" in modularChainInfo) {
              if (modularChainInfo.chainId === "starknet:SN_SEPOLIA")
                return null;

              return (
                <React.Fragment>
                  <Gutter size="1.25rem" />
                  <StakedBalance modularChainInfo={modularChainInfo} />
                </React.Fragment>
              );
            }
            return null;
          })()}

          {(() => {
            const infos: {
              title: string;
              text: string;
              textDeco?: "green";
            }[] = [];

            if (currency.coinGeckoId) {
              const price = priceStore.calculatePrice(
                new CoinPretty(
                  currency,
                  DecUtils.getTenExponentN(currency.coinDecimals)
                )
              );
              if (price) {
                let textDeco: "green" | undefined = undefined;
                let text = price.roundTo(3).toString();
                if (price24HChange) {
                  // Max decimals가 2인데 이 경우 숫자가 0.00123%같은 경우면 +0.00% 같은식으로 표시될 수 있다.
                  // 이 경우는 오차를 무시하고 0.00%로 생각한다.
                  if (
                    price24HChange
                      .toDec()
                      .abs()
                      // 백분율을 고려해야되기 때문에 -2가 아니라 -4임
                      .lte(DecUtils.getTenExponentN(-4))
                  ) {
                    text += " (0.00%)";
                  } else {
                    text += ` (${price24HChange
                      .maxDecimals(2)
                      .trim(false)
                      .shrink(true)
                      .sign(true)
                      .inequalitySymbol(false)
                      .toString()})`;

                    if (price24HChange.toDec().gt(Dec.zero)) {
                      textDeco = "green";
                    }
                  }
                }
                if ("originCurrency" in currency && currency.originCurrency) {
                  infos.push({
                    title: `${currency.originCurrency.coinDenom} Price`,
                    text,
                    textDeco,
                  });
                } else {
                  infos.push({
                    title: `${currency.coinDenom} Price`,
                    text,
                    textDeco,
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
          {(() => {
            // 최초 loading 중인 경우
            if (msgHistory.pages.length === 0) {
              return (
                <Box padding="0.75rem" paddingTop="0">
                  <Box paddingX="0.375rem" marginBottom="0.5rem" marginTop="0">
                    <Box
                      width="5.125rem"
                      height="0.8125rem"
                      backgroundColor={
                        theme.mode === "light"
                          ? ColorPalette["white"]
                          : ColorPalette["gray-600"]
                      }
                    />
                  </Box>
                  <Stack gutter="0.5rem">
                    <MsgItemSkeleton />
                    <MsgItemSkeleton />
                  </Stack>
                </Box>
              );
            }

            if (msgHistory.pages.find((page) => page.error != null)) {
              return (
                <EmptyView
                  altSvg={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="73"
                      height="73"
                      fill="none"
                      viewBox="0 0 73 73"
                    >
                      <path
                        stroke={
                          theme.mode === "light"
                            ? ColorPalette["gray-200"]
                            : ColorPalette["gray-400"]
                        }
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="6"
                        d="M46.15 49.601a13.635 13.635 0 00-9.626-4.006 13.636 13.636 0 00-9.72 4.006m37.03-13.125c0 15.11-12.249 27.357-27.358 27.357S9.12 51.585 9.12 36.476 21.367 9.12 36.476 9.12c15.11 0 27.357 12.248 27.357 27.357zm-34.197-6.839c0 1.26-.51 2.28-1.14 2.28-.63 0-1.14-1.02-1.14-2.28 0-1.26.51-2.28 1.14-2.28.63 0 1.14 1.02 1.14 2.28zm-1.14 0h.023v.046h-.023v-.046zm17.098 0c0 1.26-.51 2.28-1.14 2.28-.63 0-1.14-1.02-1.14-2.28 0-1.26.51-2.28 1.14-2.28.63 0 1.14 1.02 1.14 2.28zm-1.14 0h.023v.046h-.023v-.046z"
                      />
                    </svg>
                  }
                >
                  <Box marginX="2rem">
                    <Stack alignX="center" gutter="0.1rem">
                      <Subtitle3>Network error.</Subtitle3>
                      <Subtitle3
                        style={{
                          textAlign: "center",
                        }}
                      >
                        Please try again after a few minutes.
                      </Subtitle3>
                    </Stack>
                  </Box>
                </EmptyView>
              );
            }

            if (msgHistory.pages[0].response?.isUnsupported || !isSupported) {
              // TODO: 아직 cosmos 체인이 아니면 embedded인지 아닌지 구분할 수 없다.
              if (
                ("cosmos" in modularChainInfo &&
                  chainStore.getChain(chainId).embedded.embedded) ||
                "starknet" in modularChainInfo
              ) {
                return (
                  <EmptyView>
                    <Box marginX="2rem">
                      <Stack alignX="center" gutter="0.1rem">
                        <Subtitle3 style={{ fontWeight: 700 }}>
                          Transaction History Unavailable
                        </Subtitle3>
                        <Subtitle3
                          style={{
                            textAlign: "center",
                          }}
                        >
                          {`We're working on expanding the feature support for native chains.`}
                        </Subtitle3>
                      </Stack>
                    </Box>
                  </EmptyView>
                );
              }

              return (
                <EmptyView>
                  <Box marginX="2rem">
                    <Subtitle3>Non-native chains not supported</Subtitle3>
                  </Box>
                </EmptyView>
              );
            }

            // 아무 history도 없는 경우
            if (msgHistory.pages[0].response?.msgs.length === 0) {
              return (
                <EmptyView>
                  <Box marginX="2rem">
                    <Subtitle3>No recent transaction history</Subtitle3>
                  </Box>
                </EmptyView>
              );
            }

            return (
              <RenderMessages
                msgHistory={msgHistory}
                targetDenom={coinMinimalDenom}
              />
            );
          })()}
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
