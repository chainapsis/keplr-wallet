import React, { useState } from "react";
import styled, { css, useTheme } from "styled-components";
import { ColorPalette } from "../../../../styles";
import { Body3, Caption2, Subtitle4 } from "../../../../components/typography";
import { KeyInfo } from "@keplr-wallet/background";
import { observer } from "mobx-react-lite";
import { Tooltip } from "../../../../components/tooltip";
import { EllipsisIcon } from "../../../../components/icon";
import { XAxis, YAxis } from "../../../../components/axis";
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
import { autoUpdate } from "@floating-ui/react-dom";
import { FloatModal } from "../../../../components/float-modal";
import { useGetKeyInfoParagraph } from "../../../../hooks/key-info";
import { useGetIcnsName } from "../../../../hooks/use-get-icns-name";
import { ContextMenuStyles } from "../../../../components/context-menu";
import { AccountNameIcon } from "../account-icon";

const Styles = {
  AccountItem: styled.div<{ isSelected: boolean }>`
    padding: 1rem 0.5rem;
    cursor: ${({ isSelected }) => (isSelected ? "default" : "pointer")};
    display: flex;
    align-items: center;
    justify-content: space-between;

    ${({ isSelected }) =>
      isSelected &&
      css`
        background-color: ${({ theme }) =>
          theme.mode === "light"
            ? ColorPalette["gray-75"]
            : ColorPalette["gray-600"]};
      `}

    transition: background-color 0.1s ease-in-out;
    border-radius: 0.5rem;
    &:hover {
      background-color: ${({ theme }) =>
        theme.mode === "light"
          ? ColorPalette["gray-75"]
          : ColorPalette["gray-600"]};
    }
  `,

  AccountName: styled(Subtitle4)<{ isSelected: boolean }>`
    color: ${({ theme }) =>
      theme.mode === "light" ? ColorPalette["gray-700"] : ColorPalette.white};

    line-height: 1.25;
    max-width: 8.75rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    ${({ isSelected }) =>
      isSelected &&
      css`
        opacity: ${COMMON_HOVER_OPACITY};
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

export const AccountItemSwitchModal = observer(
  ({
    keyInfo,
    bech32Address,
    isSelected,
    onSelect,
  }: {
    keyInfo: KeyInfo;
    bech32Address: string;
    isSelected: boolean;
    onSelect: (isSelected: boolean) => void;
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
    const paragraph = useGetKeyInfoParagraph(keyInfo, true);
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

    return (
      <React.Fragment>
        <Styles.AccountItem
          isSelected={isSelected}
          onClick={(e) => {
            e.preventDefault();
            onSelect(isSelected);
          }}
        >
          <XAxis alignY="center">
            <AccountNameIcon
              keyInfoType={keyInfo.type}
              name={accountName}
              style={{
                opacity: isSelected ? COMMON_HOVER_OPACITY : 1,
              }}
            />
            <Gutter size="0.625rem" />

            <YAxis>
              <XAxis alignY="center">
                <Styles.AccountName isSelected={isSelected}>
                  {accountName}
                </Styles.AccountName>
                {icnsPrimaryName && (
                  <React.Fragment>
                    <Gutter size="0.375rem" />
                    <Tooltip
                      hideArrow={true}
                      content={
                        <Caption2 color={ColorPalette["white"]}>
                          {icnsPrimaryName}
                        </Caption2>
                      }
                      allowedPlacements={["top", "bottom", "right"]}
                    >
                      <Image
                        alt="icns-icon"
                        src={require(theme.mode === "light"
                          ? "../../../../public/assets/img/icns-icon-light.png"
                          : "../../../../public/assets/img/icns-icon.png")}
                        style={{
                          width: "1rem",
                          height: "1rem",
                          opacity: isSelected ? COMMON_HOVER_OPACITY : 1,
                        }}
                      />
                    </Tooltip>
                  </React.Fragment>
                )}
              </XAxis>
              {paragraph ? (
                <React.Fragment>
                  <Gutter size="0.25rem" />
                  <Body3
                    style={{
                      color: ColorPalette["gray-300"],
                    }}
                  >
                    {paragraph}
                  </Body3>
                </React.Fragment>
              ) : null}
            </YAxis>
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
