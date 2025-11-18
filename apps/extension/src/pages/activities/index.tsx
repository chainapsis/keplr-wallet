import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import { Box } from "../../components/box";
import { MainHeaderLayout } from "../main/layouts/header";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { usePaginatedCursorQuery } from "../main/token-detail/hook";
import { ResMsgsHistory } from "../main/token-detail/types";
import { PaginationLimit, Relations } from "../main/token-detail/constants";
import { RenderMessages } from "../main/token-detail/messages";
import { ColorPalette } from "../../styles";
import { Stack } from "../../components/stack";
import { MsgItemSkeleton } from "../main/token-detail/msg-items/skeleton";
import { useTheme } from "styled-components";
import { Gutter } from "../../components/gutter";
import { Dropdown } from "../../components/dropdown";
import { EmptyView } from "../../components/empty-view";
import { H4, Subtitle3 } from "../../components/typography";
import { useGlobarSimpleBar } from "../../hooks/global-simplebar";
import { IAccountStore, IChainStore } from "@keplr-wallet/stores";
import { action, computed, makeObservable, observable } from "mobx";
import { Bech32Address, ChainIdHelper } from "@keplr-wallet/cosmos";
import { FormattedMessage } from "react-intl";
import { ModularChainInfo } from "@keplr-wallet/types";

// React hook으로 처리하기 귀찮은 부분이 많아서
// 그냥 대충 mobx로...
class OtherHexAddresses {
  @observable.ref
  protected supportedChainList: ModularChainInfo[] = [];

  constructor(
    protected readonly chainStore: IChainStore,
    protected readonly accountStore: IAccountStore,
    protected readonly baseChainId: string
  ) {
    makeObservable(this);
  }

  @action
  setSupportedChainList(chainInfos: ModularChainInfo[]) {
    this.supportedChainList = chainInfos;
  }

  @computed
  get otherHexAddresses(): {
    chainIdentifier: string;
    hexAddress: string;
  }[] {
    const baseAddress = this.accountStore.getAccount(
      this.baseChainId
    ).bech32Address;
    if (baseAddress) {
      return this.supportedChainList
        .filter((chainInfo) => {
          return chainInfo.chainId !== this.baseChainId;
        })
        .filter((chainInfo) => {
          const baseAccount = this.accountStore.getAccount(this.baseChainId);
          const account = this.accountStore.getAccount(chainInfo.chainId);

          if (!account.ethereumHexAddress && !account.bech32Address) {
            return false;
          }

          const baseAccountHexAddress = baseAccount.hasEthereumHexAddress
            ? baseAccount.ethereumHexAddress
            : Bech32Address.fromBech32(baseAccount.bech32Address).toHex();
          const accountHexAddress = account.hasEthereumHexAddress
            ? account.ethereumHexAddress
            : Bech32Address.fromBech32(account.bech32Address).toHex();

          return baseAccountHexAddress !== accountHexAddress;
        })
        .map((chainInfo) => {
          const account = this.accountStore.getAccount(chainInfo.chainId);
          const accountHexAddress = account.hasEthereumHexAddress
            ? account.ethereumHexAddress
            : Bech32Address.fromBech32(account.bech32Address).toHex();

          return {
            chainIdentifier: ChainIdHelper.parse(chainInfo.chainId).identifier,
            hexAddress: accountHexAddress,
          };
        });
    }

    return [];
  }
}

export const ActivitiesPage: FunctionComponent = observer(() => {
  const { chainStore, accountStore, priceStore, queriesStore } = useStore();

  const [otherHexAddresses] = useState(
    () => new OtherHexAddresses(chainStore, accountStore, "cosmoshub")
  );
  const account = accountStore.getAccount("cosmoshub");

  const [selectedKey, setSelectedKey] = useState<string>("__all__");

  const querySupported = queriesStore.simpleQuery.queryGet<string[]>(
    process.env["KEPLR_EXT_CONFIG_SERVER"],
    "/tx-history/supports"
  );

  const supportedChainList = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const chainIdentifier of querySupported.response?.data ?? []) {
      map.set(chainIdentifier, true);
    }

    return chainStore.modularChainInfosInListUI.filter((chainInfo) => {
      return (
        map.get(ChainIdHelper.parse(chainInfo.chainId).identifier) ?? false
      );
    });
  }, [chainStore.modularChainInfosInListUI, querySupported.response?.data]);

  otherHexAddresses.setSupportedChainList(supportedChainList);

  const msgHistory = usePaginatedCursorQuery<ResMsgsHistory>(
    process.env["KEPLR_EXT_TX_HISTORY_BASE_URL"],
    () => {
      const baseHexAddress = account.hasEthereumHexAddress
        ? account.ethereumHexAddress
        : Bech32Address.fromBech32(account.bech32Address).toHex();
      return `/history/v2/msgs/keplr-multi-chain?baseHexAddress=${baseHexAddress}&chainIdentifiers=${(() => {
        if (selectedKey === "__all__") {
          return supportedChainList
            .map((chainInfo) => chainInfo.chainId)
            .join(",");
        }
        return selectedKey;
      })()}&relations=${Relations.join(",")}&vsCurrencies=${
        priceStore.defaultVsCurrency
      }&limit=${PaginationLimit}${(() => {
        if (otherHexAddresses.otherHexAddresses.length === 0) {
          return "";
        }
        return `&otherHexAddresses=${otherHexAddresses.otherHexAddresses
          .map((address) => {
            return `${address.chainIdentifier}|${address.hexAddress}`;
          })
          .join(",")}`;
      })()}`;
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
    },
    `${selectedKey}/${supportedChainList
      .map((chainInfo) => chainInfo.chainId)
      .join(",")}/${otherHexAddresses.otherHexAddresses
      .map((address) => `${address.chainIdentifier}|${address.hexAddress}`)
      .join(",")}`,
    (key: string) => {
      // key가 아래와 같으면 querySupported나 account 중 하나도 load되지 않은 경우다.
      // 이런 경우 query를 할 필요가 없다.
      return key !== `${selectedKey}//`;
    }
  );

  const theme = useTheme();

  const globalSimpleBar = useGlobarSimpleBar();
  useEffect(() => {
    if (globalSimpleBar.ref.current) {
      const scrollElement = globalSimpleBar.ref.current.getScrollElement();
      if (scrollElement) {
        // scroll to refresh
        const onScroll = () => {
          const el = globalSimpleBar.ref.current?.getContentElement();
          const scrollEl = globalSimpleBar.ref.current?.getScrollElement();
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

        scrollElement.addEventListener("scroll", onScroll);

        return () => {
          scrollElement.removeEventListener("scroll", onScroll);
        };
      }
    }
  }, [globalSimpleBar.ref, msgHistory]);

  return (
    <MainHeaderLayout
      headerContainerStyle={{
        borderBottomStyle: "solid",
        borderBottomWidth: "1px",
        borderBottomColor:
          theme.mode === "light"
            ? ColorPalette["gray-100"]
            : ColorPalette["gray-500"],
      }}
    >
      <Box>
        <Box alignX="center" alignY="center" paddingY="1.25rem">
          <H4
            color={
              theme.mode === "light"
                ? ColorPalette["black"]
                : ColorPalette["white"]
            }
          >
            <FormattedMessage id="page.activity.title" />
          </H4>
        </Box>
        <Box paddingX="0.75rem">
          <Dropdown
            size="large"
            allowSearch={true}
            searchExcludedKeys={["__all__"]}
            selectedItemKey={selectedKey}
            onSelect={(key) => {
              setSelectedKey(key);
            }}
            items={[
              {
                key: "__all__",
                label: "All",
              },
              ...supportedChainList.map((chainInfo) => {
                return {
                  key: chainInfo.chainId,
                  label: chainInfo.chainName,
                };
              }),
            ]}
          />
        </Box>
        <Gutter size="0.5rem" />

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
                  <MsgItemSkeleton />
                  <MsgItemSkeleton />
                  <MsgItemSkeleton />
                </Stack>
              </Box>
            );
          }

          if (msgHistory.pages.find((page) => page.error != null)) {
            return (
              <EmptyView
                style={{
                  marginTop: "2rem",
                  marginBottom: "2rem",
                }}
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

          // 아무 history도 없는 경우
          if (msgHistory.pages[0].response?.msgs.length === 0) {
            return (
              <EmptyView
                style={{
                  marginTop: "2rem",
                  marginBottom: "2rem",
                }}
              >
                <Box marginX="2rem">
                  <Subtitle3>No recent transaction history</Subtitle3>
                </Box>
              </EmptyView>
            );
          }

          return (
            <RenderMessages
              msgHistory={msgHistory}
              targetDenom={(msg) => {
                // "custom/merged-claim-rewards"는 예외임
                if (msg.relation === "custom/merged-claim-rewards") {
                  if (!msg.denoms || msg.denoms.length === 0) {
                    throw new Error(`Invalid denoms: ${msg.denoms})`);
                  }
                  const modularChainInfoImpl =
                    chainStore.getModularChainInfoImpl(msg.chainId);

                  if (
                    ChainIdHelper.parse(msg.chainId).identifier ===
                    "dydx-mainnet"
                  ) {
                    // dydx는 USDC에 우선권을 줌
                    if (
                      msg.denoms.includes(
                        "ibc/8E27BA2D5493AF5636760E354E46004562C46AB7EC0CC4C1CA14E9E20E2545B5"
                      )
                    ) {
                      return "ibc/8E27BA2D5493AF5636760E354E46004562C46AB7EC0CC4C1CA14E9E20E2545B5";
                    }
                  }
                  if (modularChainInfoImpl.stakeCurrency) {
                    if (
                      msg.denoms.includes(
                        modularChainInfoImpl.stakeCurrency.coinMinimalDenom
                      )
                    ) {
                      return modularChainInfoImpl.stakeCurrency
                        .coinMinimalDenom;
                    }
                  }
                  return msg.denoms[0];
                }
                if (!msg.denoms || msg.denoms.length !== 1) {
                  // 백엔드에서 denoms는 무조건 한개 오도록 보장한다.
                  throw new Error(`Invalid denoms: ${msg.denoms})`);
                }

                return msg.denoms[0];
              }}
              isInAllActivitiesPage={true}
            />
          );
        })()}
      </Box>
    </MainHeaderLayout>
  );
});
