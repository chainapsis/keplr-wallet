import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import styled, { css, useTheme } from "styled-components";
import SimpleBar from "simplebar-react";
import { ColorPalette } from "../../../../styles";
import {
  Body3,
  Caption1,
  Caption2,
  Subtitle3,
  Subtitle4,
} from "../../../../components/typography";
import { useStore } from "../../../../stores";
import { KeyInfo } from "@keplr-wallet/background";
import { observer } from "mobx-react-lite";
import { dispatchGlobalEventExceptSelf } from "../../../../utils/global-events";
import { SearchTextInput } from "../../../../components/input";
import { Tooltip } from "../../../../components/tooltip";
import { EllipsisIcon } from "../../../../components/icon";
import { XAxis } from "../../../../components/axis";
import { Image } from "../../../../components/image";
import { Gutter } from "../../../../components/gutter";
import { COMMON_HOVER_OPACITY } from "../../../../styles/constant";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router";
import {
  offset,
  useDismiss,
  useFloating,
  useInteractions,
} from "@floating-ui/react";
import {
  ReferenceType,
  UseFloatingReturn,
  autoUpdate,
} from "@floating-ui/react-dom";
import { FloatModal } from "../../../../components/float-modal";
import { useSearchKeyInfos } from "../../../../hooks/use-search-key-infos";
import { useGetAllSortedKeyInfos } from "../../../../hooks/use-key-ring-sort";
import { useGetIcnsName } from "../../../../hooks/use-get-icns-name";
import { ContextMenuStyles } from "../../../../components/context-menu";
import { stringLengthByGrapheme } from "../../../../utils/string";
import { IconProps } from "../../../../components/icon/types";
import { Box } from "../../../../components/box";

const AccountItem = observer(
  ({
    keyInfo,
    bech32Address,
    isSelected,
    onSelect,
  }: {
    keyInfo: KeyInfo;
    bech32Address: string;
    isSelected: boolean;
    onSelect: () => void;
  }) => {
    const theme = useTheme();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const intl = useIntl();
    const navigate = useNavigate();

    const { x, y, strategy, refs, context } = useFloating({
      placement: "bottom-end",
      middleware: [offset({})],
      open: isMenuOpen,
      onOpenChange: setIsMenuOpen,
      whileElementsMounted: autoUpdate,
    });
    const dismiss = useDismiss(context);
    const { getReferenceProps, getFloatingProps } = useInteractions([dismiss]);

    const icnsPrimaryName = useGetIcnsName(bech32Address);

    const dropdownItems = (() => {
      const defaults = [
        {
          key: "change-wallet-name",
          label: intl.formatMessage({
            id: "page.wallet.keyring-item.dropdown.change-wallet-name-title",
          }),
          onSelect: () => navigate(`/wallet/change-name?id=${keyInfo.id}`),
        },
        {
          key: "delete-wallet",
          label: intl.formatMessage({
            id: "page.wallet.keyring-item.dropdown.delete-wallet-title",
          }),
          onSelect: () => navigate(`/wallet/delete?id=${keyInfo.id}`),
        },
      ];

      switch (keyInfo.type) {
        case "mnemonic": {
          defaults.unshift({
            key: "view-recovery-phrase",
            label: intl.formatMessage({
              id: "page.wallet.keyring-item.dropdown.view-recovery-path-title",
            }),
            onSelect: () => navigate(`/wallet/show-sensitive?id=${keyInfo.id}`),
          });
          break;
        }
        case "private-key": {
          defaults.unshift({
            key: "view-recovery-phrase",
            label: intl.formatMessage({
              id: "page.wallet.keyring-item.dropdown.view-private-key-title",
            }),
            onSelect: () => navigate(`/wallet/show-sensitive?id=${keyInfo.id}`),
          });
          break;
        }
      }

      return defaults;
    })();

    const accountName = keyInfo.name || "Keplr Account";
    const firstLetter = (() => {
      if (stringLengthByGrapheme(accountName) !== accountName.length) {
        return "A";
      }
      return accountName[0].toUpperCase();
    })();

    return (
      <React.Fragment>
        <Styles.AccountItem onClick={onSelect}>
          <XAxis alignY="center">
            <Styles.AccountIcon isSelected={isSelected}>
              <Caption1
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-300"]
                    : ColorPalette["gray-200"]
                }
              >
                {firstLetter.toUpperCase()}
              </Caption1>
            </Styles.AccountIcon>
            <Gutter size="0.625rem" />
            <Styles.AccountName isSelected={isSelected}>
              {accountName}
            </Styles.AccountName>

            {icnsPrimaryName && (
              <React.Fragment>
                <Gutter size="0.25rem" />
                <Tooltip
                  content={
                    <Caption2 color={ColorPalette["white"]}>
                      {icnsPrimaryName}
                    </Caption2>
                  }
                  allowedPlacements={["top", "bottom"]}
                >
                  <Image
                    alt="icns-icon"
                    src={require(theme.mode === "light"
                      ? "../../../../public/assets/img/icns-icon-light.png"
                      : "../../../../public/assets/img/icns-icon.png")}
                    style={{
                      width: "1rem",
                      height: "1rem",
                      opacity: isSelected ? 0.6 : 1,
                    }}
                  />
                </Tooltip>
              </React.Fragment>
            )}
          </XAxis>

          <Styles.OptionButton
            ref={refs.setReference}
            {...getReferenceProps()}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
          >
            <EllipsisIcon
              width="1.5rem"
              height="1.5rem"
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-300"]
                  : ColorPalette["gray-10"]
              }
            />
          </Styles.OptionButton>
        </Styles.AccountItem>

        <FloatModal
          isOpen={isMenuOpen}
          close={() => setIsMenuOpen(false)}
          disableBackdropStyle={true}
        >
          <Styles.ItemMenuContainer
            ref={refs.setFloating}
            top={y ?? 0}
            left={x ?? 0}
            strategy={strategy}
            {...getFloatingProps()}
          >
            {dropdownItems.map((item, index) => (
              <Styles.MenuItem
                key={item.key}
                isLast={index === dropdownItems.length - 1}
                onClick={item.onSelect}
              >
                {item.label}
              </Styles.MenuItem>
            ))}
          </Styles.ItemMenuContainer>
        </FloatModal>
      </React.Fragment>
    );
  }
);

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
              chainStore.getChain(uiConfigStore.icnsInfo.chainId).chainId
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
              {sortedKeyInfos.map((keyInfo) => {
                const isSelected =
                  keyInfo.id === keyRingStore.selectedKeyInfo?.id;
                return (
                  <AccountItem
                    key={keyInfo.id}
                    keyInfo={keyInfo}
                    isSelected={isSelected}
                    onSelect={() => handleAccountSelect(keyInfo)}
                    bech32Address={addressMap.get(keyInfo.id) ?? ""}
                  />
                );
              })}
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

  AccountItem: styled.div`
    padding: 1rem 0.5rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;

    transition: background-color 0.1s ease-in-out;
    border-radius: 0.5rem;
    &:hover {
      background-color: ${({ theme }) =>
        theme.mode === "light"
          ? ColorPalette["gray-75"]
          : ColorPalette["gray-600"]};
    }
  `,

  AccountIcon: styled.div<{ isSelected: boolean }>`
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 9999px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: ${({ theme }) =>
      theme.mode === "light"
        ? ColorPalette["gray-100"]
        : ColorPalette["gray-550"]};
    flex-shrink: 0;

    ${({ isSelected }) =>
      isSelected &&
      css`
        opacity: 0.6;
      `}
  `,

  AccountName: styled(Subtitle4)<{ isSelected: boolean }>`
    color: ${({ theme }) =>
      theme.mode === "light" ? ColorPalette["gray-700"] : ColorPalette.white};

    max-width: 8.75rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    ${({ isSelected }) =>
      isSelected &&
      css`
        opacity: 0.6;
      `}
  `,

  OptionButton: styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    flex-shrink: 0;
    transition: opacity 0.1s ease-in-out;

    &:hover {
      opacity: ${COMMON_HOVER_OPACITY};
    }
  `,

  ItemMenuContainer: styled(ContextMenuStyles.Container)<{
    top: number;
    left: number;
    strategy: string;
  }>`
    position: ${({ strategy }) => strategy ?? "absolute"};
    top: ${({ top }) => top.toString()}px;
    left: ${({ left }) => left.toString()}px;

    min-width: 11.25rem;
  `,

  MenuItem: styled(ContextMenuStyles.Item).attrs({ as: Body3 })<{
    isLast?: boolean;
  }>`
    padding: 0.5rem 1.5rem;
    height: 2.5rem;
    width: 100%;

    justify-content: center;
    text-align: center;

    ${({ isLast, theme }) =>
      !isLast &&
      css`
        border-bottom: 1px solid
          ${theme.mode === "light"
            ? ColorPalette["gray-100"]
            : ColorPalette["gray-400"]};
      `}
  `,
};
