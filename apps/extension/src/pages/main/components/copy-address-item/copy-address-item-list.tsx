import React from "react";
import { CopyAddressItem } from ".";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { Box } from "../../../../components/box";
import { Address } from "../deposit-modal/copy-address-scene";
import { useStore } from "../../../../stores";
import { getChainSearchResultClickAnalyticsProperties } from "../../../../analytics-amplitude";

interface CopyAddressItemListProps {
  sortedAddresses: Address[];
  close: () => void;
  blockInteraction: boolean;
  setBlockInteraction: (block: boolean) => void;
  setSortPriorities: (
    fn: (
      value: Record<string, true | undefined>
    ) => Record<string, true | undefined>
  ) => void;
  search: string;
  onClickIcon: (address: Address) => void;
}

export const CopyAddressItemList = ({
  sortedAddresses,
  close,
  blockInteraction,
  setBlockInteraction,
  setSortPriorities,
  search,
  onClickIcon,
}: CopyAddressItemListProps) => {
  const { analyticsAmplitudeStore } = useStore();

  return (
    <Box paddingX="0.75rem">
      {sortedAddresses
        .map((address) => {
          // CopyAddressItem 컴포넌트는 ethereumAddress가 있냐 없냐에 따라서 다르게 동작한다.
          // ethereumAddress가 있으면 두개의 CopyAddressItem 컴포넌트를 각각 렌더링하기 위해서
          // ethereumAddress가 있으면 두개의 address로 쪼개서 리턴하고 flat으로 펼져서 렌더링한다.
          if (address.ethereumAddress && address.bech32Address) {
            return [
              {
                modularChainInfo: address.modularChainInfo,
                bech32Address: address.bech32Address,
              },
              {
                ...address,
              },
            ];
          }

          return address;
        })
        .flat()
        .map((address, index) => {
          return (
            <CopyAddressItem
              key={
                ChainIdHelper.parse(address.modularChainInfo.chainId)
                  .identifier +
                address.bech32Address +
                (address.ethereumAddress || "") +
                (address.bitcoinAddress?.bech32Address || "")
              }
              address={address}
              close={close}
              blockInteraction={blockInteraction}
              setBlockInteraction={setBlockInteraction}
              setSortPriorities={setSortPriorities}
              onClick={() => {
                if (search.trim().length > 0) {
                  analyticsAmplitudeStore.logEvent(
                    "click_copy_address_item_search_results_deposit_modal",
                    getChainSearchResultClickAnalyticsProperties(
                      address.modularChainInfo.chainName,
                      search,
                      sortedAddresses.map(
                        (address) => address.modularChainInfo.chainName
                      ),
                      index
                    )
                  );
                }
              }}
              onClickIcon={() => onClickIcon(address)}
            />
          );
        })}
    </Box>
  );
};
