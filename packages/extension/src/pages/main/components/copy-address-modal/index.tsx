import React, { FunctionComponent, useState } from "react";
import styled from "styled-components";
import { ColorPalette } from "../../../../styles";
import {
  Subtitle1,
  Subtitle3,
  Caption1,
  Button2,
} from "../../../../components/typography";
import { SearchTextInput } from "../../../../components/input";
import { Column, Columns } from "../../../../components/column";
import { StarIcon } from "../../../../components/icon";
import { Box } from "../../../../components/box";
import { Gutter } from "../../../../components/gutter";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { ChainInfo } from "@keplr-wallet/types";
import { XAxis, YAxis } from "../../../../components/axis";
import { Bech32Address, ChainIdHelper } from "@keplr-wallet/cosmos";
import { ChainImageFallback, Image } from "../../../../components/image";
import { useFocusOnMount } from "../../../../hooks/use-focus-on-mount";
import { Tag } from "../../../../components/tag";
import { FormattedMessage, useIntl } from "react-intl";
import SimpleBar from "simplebar-react";

const Styles = {
  Container: styled.div`
    display: flex;
    flex-direction: column;

    width: 100%;

    padding: 1.25rem 0.75rem 0 0.75rem;

    background-color: ${ColorPalette["gray-600"]};

    overflow-y: auto;
  `,
  TextButton: styled(Button2)`
    padding: 0.5rem 1rem;
  `,
};

export const CopyAddressModal: FunctionComponent<{
  close: () => void;
}> = observer(({ close }) => {
  const {
    analyticsStore,
    chainStore,
    accountStore,
    keyRingStore,
    uiConfigStore,
  } = useStore();

  const intl = useIntl();
  const [search, setSearch] = useState("");

  const searchRef = useFocusOnMount<HTMLInputElement>();

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
      const accountInfo = accountStore.getAccount(chainInfo.chainId);

      const bech32Address = accountInfo.bech32Address;
      const ethereumAddress = (() => {
        if (chainInfo.chainId.startsWith("injective")) {
          return undefined;
        }

        return accountInfo.hasEthereumHexAddress
          ? accountInfo.ethereumHexAddress
          : undefined;
      })();

      return {
        chainInfo,
        bech32Address,
        ethereumAddress,
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

  const [hasCopied, setHasCopied] = useState(false);

  return (
    <Styles.Container>
      <Subtitle1 style={{ color: ColorPalette["white"], textAlign: "center" }}>
        <FormattedMessage id="page.main.components.copy-address-modal.title" />
      </Subtitle1>

      <Gutter size="0.75rem" />
      <SearchTextInput
        ref={searchRef}
        value={search}
        onChange={(e) => {
          e.preventDefault();

          setSearch(e.target.value);
        }}
        placeholder={intl.formatMessage({
          id: "page.main.components.copy-address-modal.search-placeholder",
        })}
      />
      <Gutter size="0.75rem" />

      <SimpleBar
        style={{
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          height: "21.5rem",
        }}
      >
        {addresses.length === 0 ? (
          <Box
            alignX="center"
            alignY="center"
            paddingX="1.625rem"
            paddingTop="3.1rem"
            paddingBottom="3.2rem"
          >
            <Image
              width="140px"
              height="160px"
              src={require("../../../../public/assets/img/copy-address-no-search-result.png")}
              alt="copy-address-no-search-result-image"
            />
            <Gutter size="0.75rem" />

            <Subtitle3
              color={ColorPalette["gray-300"]}
              style={{ textAlign: "center" }}
            >
              <FormattedMessage id="page.main.components.copy-address-modal.empty-text" />
            </Subtitle3>
          </Box>
        ) : null}

        {addresses.map((address) => {
          return (
            <YAxis key={address.chainInfo.chainId}>
              <ChainAddressItem
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
                blockInteraction={hasCopied}
                afterCopied={() => {
                  analyticsStore.logEvent("click_copyAddress_copy", {
                    chainId: address.chainInfo.chainId,
                    chainName: address.chainInfo.chainName,
                  });
                  setHasCopied(true);

                  setTimeout(() => {
                    close();
                  }, 500);
                }}
              />
              {address.ethereumAddress ? (
                <EthereumAddressItem
                  ethereumAddress={address.ethereumAddress}
                  chainInfo={address.chainInfo}
                  blockInteraction={hasCopied}
                  afterCopied={() => {
                    setHasCopied(true);

                    setTimeout(() => {
                      close();
                    }, 500);
                  }}
                />
              ) : null}
            </YAxis>
          );
        })}
      </SimpleBar>
    </Styles.Container>
  );
});

export const ChainAddressItem: FunctionComponent<{
  chainInfo: ChainInfo;
  bech32Address: string;

  isBookmarked: boolean;
  setBookmarked: (isBookmarked: boolean) => void;

  // Copy하고 나면 Copy됐다는 걸 표시해준다음에
  // 약간 시간차를 두고 modal을 닫도록 한다.
  // 이걸 위해서 존재하는 prop들이다.
  // blockInteraction이 true면 click 액션 등을 막으면 된다.
  blockInteraction: boolean;
  afterCopied: () => void;
}> = ({
  chainInfo,
  bech32Address,
  isBookmarked,
  setBookmarked,
  blockInteraction,
  afterCopied,
}) => {
  const { analyticsStore } = useStore();
  const intl = useIntl();

  const [hasCopied, setHasCopied] = useState(false);

  return (
    <Box
      paddingY="0.875rem"
      paddingLeft="1rem"
      paddingRight="0.5rem"
      borderRadius="0.375rem"
      backgroundColor={ColorPalette["gray-600"]}
      hover={{
        backgroundColor: !blockInteraction
          ? ColorPalette["gray-550"]
          : undefined,
      }}
      style={{
        cursor: blockInteraction ? "auto" : "pointer",
      }}
      onClick={async (e) => {
        e.preventDefault();

        if (blockInteraction) {
          return;
        }

        await navigator.clipboard.writeText(bech32Address);
        setHasCopied(true);

        afterCopied();
      }}
    >
      <Columns sum={1} alignY="center" gutter="0.5rem">
        <Box
          cursor={blockInteraction ? undefined : "pointer"}
          style={{
            color: isBookmarked
              ? ColorPalette["blue-400"]
              : ColorPalette["gray-300"],
          }}
          onClick={(e) => {
            e.preventDefault();
            // 컨테이너로의 전파를 막아야함
            e.stopPropagation();

            if (blockInteraction) {
              return;
            }

            const newIsBookmarked = !isBookmarked;

            analyticsStore.logEvent("click_favoriteChain", {
              chainId: chainInfo.chainId,
              chainName: chainInfo.chainName,
              isFavorite: newIsBookmarked,
            });

            setBookmarked(newIsBookmarked);
          }}
        >
          <StarIcon width="1.25rem" height="1.25rem" />
        </Box>

        <Box>
          <ChainImageFallback
            style={{
              width: "2rem",
              height: "2rem",
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
          style={{
            color: hasCopied
              ? ColorPalette["green-400"]
              : ColorPalette["gray-10"],
          }}
        >
          {hasCopied
            ? intl.formatMessage({
                id: "page.main.components.copy-address-modal.copied-button",
              })
            : intl.formatMessage({
                id: "page.main.components.copy-address-modal.copy-button",
              })}
        </Styles.TextButton>
      </Columns>
    </Box>
  );
};

export const EthereumAddressItem: FunctionComponent<{
  chainInfo: ChainInfo;
  ethereumAddress: string;

  blockInteraction: boolean;
  afterCopied: () => void;
}> = ({ chainInfo, ethereumAddress, blockInteraction, afterCopied }) => {
  const [hasCopied, setHasCopied] = useState(false);
  const intl = useIntl();

  return (
    <Box
      paddingY="0.875rem"
      paddingLeft="2.75rem"
      paddingRight="0.5rem"
      borderRadius="0.375rem"
      backgroundColor={ColorPalette["gray-600"]}
      hover={{
        backgroundColor: !blockInteraction
          ? ColorPalette["gray-550"]
          : undefined,
      }}
      style={{
        cursor: blockInteraction ? "auto" : "pointer",
      }}
      onClick={async (e) => {
        e.preventDefault();

        if (blockInteraction) {
          return;
        }

        await navigator.clipboard.writeText(ethereumAddress);
        setHasCopied(true);

        afterCopied();
      }}
    >
      <Columns sum={1} alignY="center" gutter="0.5rem">
        <Box>
          <ChainImageFallback
            style={{
              width: "2rem",
              height: "2rem",
            }}
            src={chainInfo.chainSymbolImageUrl}
            alt="chain icon"
          />
        </Box>
        <YAxis>
          <XAxis alignY="center">
            <Subtitle3 color={ColorPalette["gray-10"]}>
              {chainInfo.chainName}
            </Subtitle3>

            <Gutter size="0.25rem" />

            {/* Make evm tag not occupy spaces */}
            <Box position="relative" height="1px" alignY="center">
              <Box position="absolute">
                <Tag
                  text={intl.formatMessage({
                    id: "page.main.components.copy-address-modal.evm-address-tag",
                  })}
                  whiteSpace="nowrap"
                />
              </Box>
            </Box>
          </XAxis>

          <Gutter size="0.25rem" />
          <Caption1 color={ColorPalette["gray-300"]}>
            {ethereumAddress.length === 42
              ? `${ethereumAddress.slice(0, 10)}...${ethereumAddress.slice(-8)}`
              : ethereumAddress}
          </Caption1>
        </YAxis>
        <Column weight={1} />

        <Styles.TextButton
          style={{
            color: hasCopied
              ? ColorPalette["green-400"]
              : ColorPalette["gray-10"],
          }}
        >
          {hasCopied
            ? intl.formatMessage({
                id: "page.main.components.copy-address-modal.copied-button",
              })
            : intl.formatMessage({
                id: "page.main.components.copy-address-modal.copy-button",
              })}
        </Styles.TextButton>
      </Columns>
    </Box>
  );
};
