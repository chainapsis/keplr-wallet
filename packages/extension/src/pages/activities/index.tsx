import React, { FunctionComponent } from "react";
import { Box } from "../../components/box";
import { MainHeaderLayout } from "../main/layouts/header";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { usePaginatedCursorQuery } from "../main/token-detail/hook";
import { ResMsgsHistory } from "../main/token-detail/types";
import { PaginationLimit, Relations } from "../main/token-detail/constants";
import { RenderMessages } from "../main/token-detail/messages";

export const ActivitiesPage: FunctionComponent = observer(() => {
  const { chainStore, accountStore, priceStore } = useStore();

  const account = accountStore.getAccount("cosmoshub");

  const msgHistory = usePaginatedCursorQuery<ResMsgsHistory>(
    process.env["KEPLR_EXT_TX_HISTORY_BASE_URL"],
    () => {
      return `/history/msgs/keplr-multi-chain?baseBech32Address=${
        account.bech32Address
      }&chainIdentifiers=${chainStore.chainInfosInListUI
        .map((chainInfo) => chainInfo.chainId)
        .join(",")}&relations=${Relations.join(",")}&vsCurrencies=${
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
    }
  );

  return (
    <MainHeaderLayout>
      <Box paddingBottom="0.75rem">
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
      </Box>
    </MainHeaderLayout>
  );
});
