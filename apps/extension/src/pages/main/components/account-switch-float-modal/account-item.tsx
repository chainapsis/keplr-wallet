import React, { useState } from "react";
import styled, { css, useTheme } from "styled-components";
import { ColorPalette } from "../../../../styles";
import {
  Body3,
  Caption1,
  Caption2,
  Subtitle4,
} from "../../../../components/typography";
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
import { stringLengthByGrapheme } from "../../../../utils/string";
import { ContextMenuStyles } from "../../../../components/context-menu";

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
        opacity: ${COMMON_HOVER_OPACITY};
      `}
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

const _AccountIcon = ({
  firstLetter,
  keyInfoType,
  isSelected,
}: {
  firstLetter: string;
  keyInfoType: KeyInfo["type"];
  isSelected: boolean;
}) => {
  const theme = useTheme();

  return (() => {
    switch (keyInfoType) {
      case "ledger":
        return theme.mode === "light" ? <_LedgerIconLM /> : <_LedgerIconDM />;
      case "keystone":
        return theme.mode === "light" ? (
          <_KeystoneIconLM />
        ) : (
          <_KeystoneIconDM />
        );
      default:
        return (
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
        );
    }
  })();
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
    const firstLetter = (() => {
      if (stringLengthByGrapheme(accountName) !== accountName.length) {
        return "A";
      }
      return accountName[0].toUpperCase();
    })();

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
            <_AccountIcon
              firstLetter={firstLetter}
              keyInfoType={keyInfo.type}
              isSelected={isSelected}
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

const _LedgerIconLM = () => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="24" height="24" rx="12" fill="#DCDCE3" />
      <g clipPath="url(#clip0_2649_11332)">
        <path
          d="M5 14.6259V18.0465H10.266V17.2879H5.76727V14.6259H5ZM18.2327 14.6259V17.2879H13.734V18.0463H19V14.6259H18.2327ZM10.2736 9.42057V14.6258H13.734V13.9417H11.0409V9.42057H10.2736ZM5 6V9.42057H5.76727V6.75841H10.266V6H5ZM13.734 6V6.75841H18.2327V9.42057H19V6H13.734Z"
          fill="black"
        />
      </g>
      <defs>
        <clipPath id="clip0_2649_11332">
          <rect
            width="14"
            height="12.0465"
            fill="white"
            transform="translate(5 6)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};

const _LedgerIconDM = () => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="24" height="24" rx="12" fill="#242428" />
      <g clipPath="url(#clip0_2649_11348)">
        <path
          d="M5 14.6259V18.0465H10.266V17.2879H5.76727V14.6259H5ZM18.2327 14.6259V17.2879H13.734V18.0463H19V14.6259H18.2327ZM10.2736 9.42057V14.6258H13.734V13.9417H11.0409V9.42057H10.2736ZM5 6V9.42057H5.76727V6.75841H10.266V6H5ZM13.734 6V6.75841H18.2327V9.42057H19V6H13.734Z"
          fill="#FEFEFE"
        />
      </g>
      <defs>
        <clipPath id="clip0_2649_11348">
          <rect
            width="14"
            height="12.0465"
            fill="white"
            transform="translate(5 6)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};

const _KeystoneIconLM = () => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="24" height="24" rx="12" fill="#DCDCE3" />
      <path d="M7 6.5H13L9 15H6L7 6.5Z" fill="black" />
      <path d="M17 17.5H11L15 9H18L17 17.5Z" fill="#1F5AFF" />
    </svg>
  );
};

const _KeystoneIconDM = () => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="24" height="24" rx="12" fill="#242428" />
      <path d="M7 6.5H13L9 15H6L7 6.5Z" fill="#F5F8FF" />
      <path d="M17 17.5H11L15 9H18L17 17.5Z" fill="#3D71FF" />
    </svg>
  );
};
