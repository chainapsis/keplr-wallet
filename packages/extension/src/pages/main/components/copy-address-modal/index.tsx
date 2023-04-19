import React, { FunctionComponent, useState } from "react";
import styled from "styled-components";
import { ColorPalette } from "../../../../styles";
import {
  Subtitle1,
  Subtitle3,
  Caption1,
  Button2,
} from "../../../../components/typography";
import { TextInput } from "../../../../components/input";
import { Column, Columns } from "../../../../components/column";
import { SearchIcon, StarIcon } from "../../../../components/icon";
import { Box } from "../../../../components/box";
import { Gutter } from "../../../../components/gutter";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { ChainInfo } from "@keplr-wallet/types";
import { YAxis } from "../../../../components/axis";
import { Bech32Address, ChainIdHelper } from "@keplr-wallet/cosmos";
import { ChainImageFallback } from "../../../../components/image";

const Styles = {
  Container: styled.div`
    display: flex;
    flex-direction: column;

    width: 100%;

    padding: 1.25rem 0.75rem 0 0.75rem;

    background-color: ${ColorPalette["gray-600"]};

    overflow-y: scroll;
  `,
  ItemContainer: styled.div`
    padding: 0.875rem 0.5rem 0.875rem 1rem;
  `,
  TextButton: styled(Button2)`
    cursor: pointer;
    padding: 0.5rem 1rem;
  `,
};

export const CopyAddressModal: FunctionComponent<{
  close: () => void;
}> = observer(({ close }) => {
  const { chainStore, accountStore, keyRingStore, uiConfigStore } = useStore();

  const [search, setSearch] = useState("");

  // 북마크된 체인과 sorting을 위한 state는 분리되어있다.
  // 이걸 분리하지 않고 북마크된 체인은 무조건 올린다고 가정하면
  // 유저 입장에서 북마크 버튼을 누르는 순간 그 체인은 위로 올라가게 되고
  // 아래에 있던 체인의 경우는 유저가 보기에 갑자기 사라진 것처럼 보일 수 있고
  // 그게 아니더라도 추가적인 인터렉션을 위해서 스크롤이 필요해진다.
  // 이 문제를 해결하기 위해서 state가 분리되어있다.
  // 처음 시자할때는 북마크된 체인 기준으로 하고 이후에 북마크가 해제된 체인의 경우만 정렬 우선순위에서 뺀다.
  const [sortPriorities, setSortPriorities] = useState<
    Record<string, true | undefined>
  >(() => {
    if (!keyRingStore.selectedKeyInfo) {
      return {};
    }
    const res: Record<string, true | undefined> = {};
    for (const chainInfo of chainStore.chainInfosInUI) {
      if (
        uiConfigStore.copyAddressConfig.isBookmarkedChain(
          keyRingStore.selectedKeyInfo.id,
          chainInfo.chainId
        )
      ) {
        res[chainInfo.chainIdentifier] = true;
      }
    }
    return res;
  });

  const addresses = chainStore.chainInfosInUI
    .map((chainInfo) => {
      const bech32Address = accountStore.getAccount(
        chainInfo.chainId
      ).bech32Address;
      return {
        chainInfo,
        bech32Address,
      };
    })
    .filter((address) => {
      if (address.bech32Address.length === 0) {
        return false;
      }

      const s = search.trim();
      if (s.length === 0) {
        return true;
      }

      if (address.chainInfo.chainId.includes(s)) {
        return true;
      }
      if (address.chainInfo.chainName.includes(s)) {
        return true;
      }
      const bech32Split = address.bech32Address.split("1");
      if (bech32Split.length > 0) {
        if (bech32Split[0].includes(s)) {
          return true;
        }
      }
    })
    .sort((a, b) => {
      const aPriority = sortPriorities[a.chainInfo.chainIdentifier];
      const bPriority = sortPriorities[b.chainInfo.chainIdentifier];

      if (aPriority && bPriority) {
        return 0;
      }
      if (aPriority) {
        return -1;
      }
      if (bPriority) {
        return 1;
      }
      return 0;
    });

  return (
    <Styles.Container>
      <Subtitle1 style={{ color: ColorPalette["white"], textAlign: "center" }}>
        Copy Address
      </Subtitle1>

      <Gutter size="0.75rem" />
      <TextInput
        value={search}
        onChange={(e) => {
          e.preventDefault();

          setSearch(e.target.value);
        }}
        placeholder="Search for a chain"
        left={<SearchIcon width="1.25rem" height="1.25rem" />}
      />
      <Gutter size="0.75rem" />

      <Box
        height="21.5rem"
        style={{
          overflowY: "scroll",
        }}
      >
        {addresses.map((address) => {
          return (
            <ChainAddressItem
              key={address.chainInfo.chainId}
              chainInfo={address.chainInfo}
              bech32Address={address.bech32Address}
              isBookmarked={
                keyRingStore.selectedKeyInfo
                  ? uiConfigStore.copyAddressConfig.isBookmarkedChain(
                      keyRingStore.selectedKeyInfo.id,
                      address.chainInfo.chainId
                    )
                  : false
              }
              setBookmarked={(value) => {
                if (keyRingStore.selectedKeyInfo) {
                  if (value) {
                    uiConfigStore.copyAddressConfig.bookmarkChain(
                      keyRingStore.selectedKeyInfo.id,
                      address.chainInfo.chainId
                    );
                  } else {
                    uiConfigStore.copyAddressConfig.unbookmarkChain(
                      keyRingStore.selectedKeyInfo.id,
                      address.chainInfo.chainId
                    );

                    setSortPriorities((priorities) => {
                      const identifier = ChainIdHelper.parse(
                        address.chainInfo.chainId
                      ).identifier;
                      const newPriorities = { ...priorities };
                      if (newPriorities[identifier]) {
                        delete newPriorities[identifier];
                      }
                      return newPriorities;
                    });
                  }
                }
              }}
              close={close}
            />
          );
        })}
      </Box>
    </Styles.Container>
  );
});

export const ChainAddressItem: FunctionComponent<{
  chainInfo: ChainInfo;
  bech32Address: string;

  isBookmarked: boolean;
  setBookmarked: (isBookmarked: boolean) => void;

  close: () => void;
}> = ({ chainInfo, bech32Address, isBookmarked, setBookmarked, close }) => {
  return (
    <Styles.ItemContainer>
      <Columns sum={1} alignY="center" gutter="0.5rem">
        <Box
          cursor="pointer"
          style={{
            color: isBookmarked
              ? ColorPalette["blue-400"]
              : ColorPalette["gray-300"],
          }}
          onClick={(e) => {
            e.preventDefault();

            setBookmarked(!isBookmarked);
          }}
        >
          <StarIcon width="1.25rem" height="1.25rem" />
        </Box>

        <Box>
          <ChainImageFallback
            style={{
              width: "2.25rem",
              height: "2.25rem",
            }}
            src={chainInfo.chainSymbolImageUrl}
            alt="chain icon"
          />
        </Box>
        <YAxis>
          <Subtitle3 color={ColorPalette["gray-10"]}>
            {chainInfo.chainName}
          </Subtitle3>
          <Gutter size="0.25rem" />
          <Caption1 color={ColorPalette["gray-300"]}>
            {Bech32Address.shortenAddress(bech32Address, 20)}
          </Caption1>
        </YAxis>
        <Column weight={1} />
        {/* TODO: Copy 버튼이 눌린 직후의 action을 어케할지 아직 안 정해짐 */}
        <Styles.TextButton
          onClick={async (e) => {
            e.preventDefault();

            await navigator.clipboard.writeText(bech32Address);

            close();
          }}
        >
          Copy
        </Styles.TextButton>
      </Columns>
    </Styles.ItemContainer>
  );
};
