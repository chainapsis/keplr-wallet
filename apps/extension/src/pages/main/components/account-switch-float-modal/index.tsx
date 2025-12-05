import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import styled, { useTheme } from "styled-components";
import SimpleBar from "simplebar-react";
import { ColorPalette } from "../../../../styles";
import { Subtitle3 } from "../../../../components/typography";
import { useStore } from "../../../../stores";
import { KeyInfo } from "@keplr-wallet/background";
import { observer } from "mobx-react-lite";
import { dispatchGlobalEventExceptSelf } from "../../../../utils/global-events";
import { SearchTextInput } from "../../../../components/input";
import { Gutter } from "../../../../components/gutter";
import { COMMON_HOVER_OPACITY } from "../../../../styles/constant";
import { useIntl } from "react-intl";
import { ReferenceType, UseFloatingReturn } from "@floating-ui/react-dom";
import { FloatModal } from "../../../../components/float-modal";
import { useSearchKeyInfos } from "../../../../hooks/use-search-key-infos";
import { useGetAllSortedKeyInfos } from "../../../../hooks/key-info";
import { IconProps } from "../../../../components/icon/types";
import { Box } from "../../../../components/box";
import { Stack } from "../../../../components/stack";
import { AccountItemSwitchModal } from "./account-item";

export const AccountSwitchFloatModal = observer(
  ({
    isOpen,
    closeModal,
    floating,
  }: {
    isOpen: boolean;
    closeModal: () => void;
    floating: Pick<
      UseFloatingReturn<ReferenceType>,
      "x" | "y" | "strategy" | "refs"
    >;
  }) => {
    const { keyRingStore, chainStore, uiConfigStore } = useStore();
    const [addressMap, setAddressMap] = useState<Map<string, string>>(
      new Map()
    );
    const searchInputRef = useRef<HTMLInputElement>(null);
    const intl = useIntl();
    const theme = useTheme();
    const { searchText, setSearchText, searchedKeyInfos } = useSearchKeyInfos();

    const closeModalInner = useCallback(() => {
      setSearchText("");
      closeModal();
    }, [closeModal, setSearchText]);

    const keyInfos = searchedKeyInfos ?? keyRingStore.keyInfos;
    const sortedKeyInfos = useGetAllSortedKeyInfos(keyInfos);
    const shouldShowSearch = keyRingStore.keyInfos.length >= 7;

    useEffect(() => {
      if (isOpen && shouldShowSearch && searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, [isOpen, shouldShowSearch]);

    useEffect(() => {
      (async () => {
        if (uiConfigStore.icnsInfo) {
          const keysSettled =
            await uiConfigStore.addressBookConfig.getVaultCosmosKeysSettled(
              chainStore.getModularChain(uiConfigStore.icnsInfo.chainId).chainId
            );
          const addressMap = new Map<string, string>();
          keysSettled.forEach((res) => {
            if (res.status === "fulfilled") {
              addressMap.set(res.value.vaultId, res.value.bech32Address);
            }
          });
          setAddressMap(addressMap);
        }
      })();
    }, [chainStore, uiConfigStore.addressBookConfig, uiConfigStore.icnsInfo]);

    const handleAccountSelect = async (keyInfo: KeyInfo) => {
      if (keyInfo.id === keyRingStore.selectedKeyInfo?.id) {
        closeModalInner();
        return;
      }

      await keyRingStore.selectKeyRing(keyInfo.id);
      await chainStore.waitSyncedEnabledChains();
      dispatchGlobalEventExceptSelf("keplr_keyring_changed");
      closeModalInner();
    };

    return (
      <React.Fragment>
        <FloatModal isOpen={isOpen} close={closeModalInner}>
          <Styles.ModalContainer
            top={floating.y ?? 0}
            left={floating.x ?? 0}
            strategy={floating.strategy}
            ref={floating.refs.setFloating}
          >
            <Styles.TitleContainer>
              <Subtitle3>
                {intl.formatMessage({ id: "page.wallet.title" })}
              </Subtitle3>
              <Box
                cursor="pointer"
                hover={{
                  opacity: COMMON_HOVER_OPACITY,
                }}
                onClick={async () => {
                  await browser.tabs.create({
                    url: "/register.html",
                  });
                }}
              >
                <_PlusIcon width="1.5rem" height="1.5rem" />
              </Box>
            </Styles.TitleContainer>

            <SimpleBar
              style={{
                maxHeight: "19.75rem",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {shouldShowSearch && (
                <Styles.SearchContainer>
                  <SearchTextInput
                    ref={searchInputRef}
                    value={searchText}
                    onChange={(e) => {
                      e.preventDefault();
                      setSearchText(e.target.value);
                    }}
                    placeholder="Search"
                    placeholderColor={
                      theme.mode === "dark"
                        ? ColorPalette["gray-300"]
                        : undefined
                    }
                    iconColor={
                      theme.mode === "dark"
                        ? ColorPalette["gray-300"]
                        : undefined
                    }
                    textInputContainerStyle={{
                      backgroundColor: "transparent",
                    }}
                    inputStyle={{
                      backgroundColor: "transparent",
                    }}
                  />
                </Styles.SearchContainer>
              )}
              <Stack gutter="0.5rem">
                {sortedKeyInfos.map((keyInfo) => {
                  const isSelected =
                    keyInfo.id === keyRingStore.selectedKeyInfo?.id;
                  return (
                    <AccountItemSwitchModal
                      key={keyInfo.id}
                      keyInfo={keyInfo}
                      isSelected={isSelected}
                      onSelect={(isSelected) => {
                        if (isSelected) {
                          return;
                        }

                        handleAccountSelect(keyInfo);
                      }}
                      bech32Address={addressMap.get(keyInfo.id) ?? ""}
                    />
                  );
                })}
              </Stack>
              <Gutter size="0.5rem" />
            </SimpleBar>
          </Styles.ModalContainer>
        </FloatModal>
      </React.Fragment>
    );
  }
);

const _PlusIcon: FunctionComponent<IconProps> = ({ width, height, color }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M12.9 5.69993C12.9 5.20287 12.4971 4.79993 12 4.79993C11.503 4.79993 11.1 5.20287 11.1 5.69993V11.0999H5.70005C5.20299 11.0999 4.80005 11.5029 4.80005 11.9999C4.80005 12.497 5.20299 12.8999 5.70005 12.8999L11.1 12.8999V18.2999C11.1 18.797 11.503 19.1999 12 19.1999C12.4971 19.1999 12.9 18.797 12.9 18.2999V12.8999H18.3C18.7971 12.8999 19.2 12.497 19.2 11.9999C19.2 11.5029 18.7971 11.0999 18.3 11.0999H12.9V5.69993Z"
        fill={color || "currentColor"}
      />
    </svg>
  );
};

const Styles = {
  ModalContainer: styled.div<{
    top: number;
    left: number;
    strategy: string;
  }>`
    position: ${({ strategy }) => strategy ?? "absolute"};
    top: ${({ top }) => top.toString()}px;
    left: ${({ left }) => left.toString()}px;
    width: 336px;
    padding: 1rem 0.5rem 0 0.5rem;

    background-color: ${({ theme }) =>
      theme.mode === "light"
        ? ColorPalette["gray-10"]
        : ColorPalette["gray-650"]};

    border-radius: 0.75rem;
    border: 1px solid
      ${({ theme }) =>
        theme.mode === "light"
          ? ColorPalette["gray-100"]
          : ColorPalette["gray-550"]};

    display: flex;
    flex-direction: column;
  `,

  TitleContainer: styled.div`
    padding: 0 0.5rem 0.25rem 0.5rem;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;

    color: ${({ theme }) =>
      theme.mode === "light" ? ColorPalette["gray-700"] : ColorPalette.white};
  `,

  SearchContainer: styled.div`
    padding: 0 0.3125rem;
    margin: 0.5rem 0;
  `,
};
