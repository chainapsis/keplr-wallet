import { observer } from "mobx-react-lite";
import { FunctionComponent } from "react";
import { usePaginatedCursorQuery } from "../../main/token-detail/hook";
import { ResMsgsHistory } from "../../main/token-detail/types";
import { useStore } from "../../../stores";
import { PaginationLimit, Relations } from "../../main/token-detail/constants";
import { ChainInfoWithCoreTypes } from "@keplr-wallet/background";
import { IChainInfoImpl } from "@keplr-wallet/stores";
import React from "react";
import { Box } from "../../../components/box";
import { useTheme } from "styled-components";
import { Stack } from "../../../components/stack";
import { ColorPalette } from "../../../styles";
import { MsgItemSkeleton } from "../../main/token-detail/msg-items/skeleton";
import { EmptyView } from "../../../components/empty-view";
import { Subtitle3 } from "../../../components/typography";
import { RenderMessages } from "../../main/token-detail/messages";

const NOBLE_CHAIN_IDENTIFIER = "noble";

export const EarnOverviewHistorySection: FunctionComponent<{
  chainInfo: IChainInfoImpl<ChainInfoWithCoreTypes>;
}> = observer(({ chainInfo }) => {
  const theme = useTheme();
  const { accountStore, priceStore } = useStore();
  const relations = Relations.filter((relation) =>
    relation.startsWith(NOBLE_CHAIN_IDENTIFIER)
  );

  const account = accountStore.getAccount(chainInfo.chainId);

  const msgHistory = usePaginatedCursorQuery<ResMsgsHistory>(
    process.env["KEPLR_EXT_TX_HISTORY_BASE_URL"],
    () => {
      return `/history/msgs/${chainInfo.chainIdentifier}/${
        account.bech32Address
      }?relations=${relations.join(",")}&vsCurrencies=${
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
    `${NOBLE_CHAIN_IDENTIFIER}/${chainInfo.chainId}/${account.bech32Address}`,
    (key: string) => {
      // key가 아래와 같으면 querySupported나 account 중 하나도 load되지 않은 경우다.
      // 이런 경우 query를 할 필요가 없다.
      return key !== `${NOBLE_CHAIN_IDENTIFIER}//`;
    }
  );

  return (
    <Box>
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
            targetDenom={(msg) =>
              msg.denoms?.[(msg.denoms?.length ?? 1) - 1] ?? "uusdn"
            }
            isInAllActivitiesPage={false}
          />
        );
      })()}
    </Box>
  );
});
