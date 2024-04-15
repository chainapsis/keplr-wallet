import React, { FunctionComponent, useState } from "react";
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

export const ActivitiesPage: FunctionComponent = observer(() => {
  const { chainStore, accountStore, priceStore } = useStore();

  const account = accountStore.getAccount("cosmoshub");

  const [selectedKey, setSelectedKey] = useState<string>("__all__");

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
              ...chainStore.chainInfosInListUI.map((chainInfo) => {
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
