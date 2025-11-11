import React, { useCallback, useEffect, useRef, useState } from "react";
import styled, { css, useTheme } from "styled-components";
import SimpleBar from "simplebar-react";
import { ColorPalette } from "../../../../styles";
import {
  Body3,
  Caption1,
  Caption2,
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

  SearchContainer: styled.div`
    padding: 0 0.5rem;
    margin-bottom: 0.5rem;
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

  ItemMenuContainer: styled.div<{
    top: number;
    left: number;
    strategy: string;
  }>`
    position: ${({ strategy }) => strategy ?? "absolute"};
    top: ${({ top }) => top.toString()}px;
    left: ${({ left }) => left.toString()}px;

    border-radius: 0.5rem;

    background-color: ${({ theme }) =>
      theme.mode === "light"
        ? "rgba(66, 66, 71, 0.90)"
        : "rgba(37, 37, 37, 0.5)"};
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);

    display: flex;
    flex-direction: column;

    min-width: 11.25rem;
  `,

  MenuItem: styled(Body3)<{ isLast?: boolean }>`
    padding: 0.5rem 1.5rem;
    cursor: pointer;
    display: flex;
    height: 2.5rem;
    width: 100%;

    justify-content: center;
    align-items: center;
    text-align: center;

    color: ${ColorPalette.white};

    &:hover {
      color: ${({ theme }) =>
        theme.mode === "light"
          ? ColorPalette["gray-50"]
          : ColorPalette["gray-200"]};
    }

    ${({ isLast, theme }) =>
      !isLast &&
      css`
        border-bottom: 1px solid
          ${theme.mode === "light"
            ? ColorPalette["gray-300"]
            : ColorPalette["gray-400"]};
      `}
  `,
};

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
    const { uiConfigStore, chainStore, queriesStore } = useStore();
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

    const icnsPrimaryName = (() => {
      if (
        uiConfigStore.icnsInfo &&
        chainStore.hasChain(uiConfigStore.icnsInfo.chainId)
      ) {
        const queries = queriesStore.get(uiConfigStore.icnsInfo.chainId);
        const icnsQuery = queries.icns.queryICNSNames.getQueryContract(
          uiConfigStore.icnsInfo.resolverContractAddress,
          bech32Address
        );

        return icnsQuery.primaryName.split(".")[0];
      }
    })();

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
    const firstLetter = accountName.length > 0 ? accountName[0] : "";

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
    const theme = useTheme();
    const searchInputRef = useRef<HTMLInputElement>(null);

    const { searchText, setSearchText, searchedKeyInfos } = useSearchKeyInfos();

    const closeModalInner = useCallback(() => {
      setSearchText("");
      closeModal();
    }, [closeModal, setSearchText]);

    const keyInfos = searchedKeyInfos ?? keyRingStore.keyInfos;
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
    }, [
      chainStore,
      keyInfos,
      uiConfigStore.addressBookConfig,
      uiConfigStore.icnsInfo,
    ]);

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
                  textInputContainerStyle={{
                    backgroundColor:
                      theme.mode === "light"
                        ? ColorPalette["white"]
                        : ColorPalette["gray-650"],
                  }}
                  inputStyle={{
                    borderColor: "red",
                    backgroundColor:
                      theme.mode === "light"
                        ? ColorPalette["white"]
                        : ColorPalette["gray-650"],
                  }}
                />
              </Styles.SearchContainer>
            )}

            <SimpleBar
              style={{
                maxHeight: "19.75rem",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {keyInfos.map((keyInfo) => {
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
