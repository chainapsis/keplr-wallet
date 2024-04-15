import React, { FunctionComponent, useMemo, useState } from "react";
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
import { Subtitle3 } from "../../components/typography";

export const ActivitiesPage: FunctionComponent = observer(() => {
  const { chainStore, accountStore, priceStore, queriesStore } = useStore();

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

    return chainStore.chainInfosInListUI.filter((chainInfo) => {
      return map.get(chainInfo.chainIdentifier) ?? false;
    });
  }, [chainStore.chainInfosInListUI, querySupported.response?.data]);

  const msgHistory = usePaginatedCursorQuery<ResMsgsHistory>(
    process.env["KEPLR_EXT_TX_HISTORY_BASE_URL"],
    () => {
      return `/history/msgs/keplr-multi-chain?baseBech32Address=${
        account.bech32Address
      }&chainIdentifiers=${(() => {
        if (selectedKey === "__all__") {
          return chainStore.chainInfosInListUI
            .map((chainInfo) => chainInfo.chainId)
            .join(",");
        }
        return selectedKey;
      })()}&relations=${Relations.join(",")}&vsCurrencies=${
        priceStore.defaultVsCurrency
      }&limit=${PaginationLimit}`;
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
    selectedKey
  );

  const theme = useTheme();

  return (
    <MainHeaderLayout>
      <Box paddingBottom="0.75rem">
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
                // 백엔드에서 denoms는 무조건 한개 오도록 보장한다.
                if (!msg.denoms || msg.denoms.length !== 1) {
                  throw new Error(`Invalid denoms: ${msg.denoms})`);
                }

                return msg.denoms[0];
              }}
            />
          );
        })()}
      </Box>
    </MainHeaderLayout>
  );
});
