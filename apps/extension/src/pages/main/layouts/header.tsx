import React, { Fragment, PropsWithChildren, useMemo, useState } from "react";
import { Columns } from "../../../components/column";
import { Box } from "../../../components/box";
import { CopyOutlineIcon } from "../../../components/icon";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { HeaderLayout } from "../../../layouts/header";
import styled, { css, useTheme } from "styled-components";
import { HeaderProps } from "../../../layouts/header/types";
import { ColorPalette } from "../../../styles";
import { XAxis, YAxis } from "../../../components/axis";
import {
  Body2,
  Caption1,
  Subtitle3,
  Subtitle4,
} from "../../../components/typography";
import { Gutter } from "../../../components/gutter";
import { ConnectedEcosystems } from "../components/connected-ecosystems";
import { COMMON_HOVER_OPACITY } from "../../../styles/constant";
import { IconButton } from "../../../components/icon-button";
import { FloatingMenuBar } from "../components/floating-menu-bar";
import { autoUpdate, offset, shift, useFloating } from "@floating-ui/react-dom";
import { AccountSwitchFloatModal } from "../components/account-switch-float-modal";
import { FloatModal } from "../../../components/float-modal";
import { DepositFloatingModal } from "../components/deposit-float-modal";
import { useLocation } from "react-router";
import { Tooltip } from "../../../components/tooltip";
import { FormattedMessage, useIntl } from "react-intl";
import { Button } from "../../../components/button";
import { useTotalPrices } from "../../../hooks/use-total-prices";
import { VerticalCollapseTransition } from "../../../components/transition/vertical-collapse";

const Styles = {
  NameContainer: styled.div`
    display: flex;
    cursor: pointer;
    align-items: center;
    justify-content: center;
  `,

  NameHoverArea: styled(Box)<{ isHover: boolean }>`
    display: flex;
    flex-direction: row;
    transition: opacity 0.1s ease-in-out;

    ${({ isHover }) =>
      isHover &&
      css`
        opacity: ${COMMON_HOVER_OPACITY};
      `}
  `,
};

const NameHoverArea = ({
  children,
  onClick,
  onHover,
  isHover,
}: {
  children: React.ReactNode;
  onClick: () => void;
  onHover: (isHover: boolean) => void;
  isHover: boolean;
}) => {
  return (
    <Styles.NameHoverArea
      onClick={onClick}
      isHover={isHover}
      onHoverStateChange={onHover}
    >
      {children}
    </Styles.NameHoverArea>
  );
};

export const MainHeaderLayout = observer<
  PropsWithChildren<
    Pick<
      HeaderProps,
      | "isNotReady"
      | "bottomButtons"
      | "fixedHeight"
      | "additionalPaddingBottom"
      | "onSubmit"
      | "headerContainerStyle"
      | "fixedTop"
    >
  > & {
    isShowTotalPrice?: boolean;
  }
>(
  (props) => {
    const { children, ...otherProps } = props;

    const { uiConfigStore, keyRingStore, chainStore } = useStore();
    const [isOpenAccountSwitchModal, setIsOpenAccountSwitchModal] =
      useState(false);
    const location = useLocation();
    const isNotMainPage = location.pathname !== "/";
    const intl = useIntl();
    const [isNameHover, setIsNameHover] = useState(false);

    const isShowTotalPrice = (() => {
      if (uiConfigStore.isPrivacyMode) {
        return false;
      }

      if (props.isShowTotalPrice) {
        return props.isShowTotalPrice;
      }

      return isNotMainPage;
    })();

    const accountSwitchFloatingModal = useFloating({
      placement: "bottom-start",
      middleware: [
        offset({
          mainAxis: 10,
        }),
      ],
    });
    const depositFloatingModal = useFloating({
      placement: "bottom-start",
      middleware: [
        offset({
          mainAxis: 10,
        }),
        shift({ padding: 12 }),
      ],
      whileElementsMounted: autoUpdate,
    });
    const { totalPrice } = useTotalPrices();

    const theme = useTheme();
    const name = useMemo(() => {
      return keyRingStore.selectedKeyInfo?.name || "Keplr Account";
    }, [keyRingStore.selectedKeyInfo?.name]);

    const [isOpenMenu, setIsOpenMenu] = React.useState(false);
    const [isOpenDepositModal, setIsOpenDepositModal] = React.useState(false);

    const openMenu = () => {
      setIsOpenMenu(true);

      if (
        uiConfigStore.newChainSuggestionConfig.newSuggestionChains.length > 0
      ) {
        uiConfigStore.newChainSuggestionConfig.turnOffSuggestionChains(
          ...uiConfigStore.newChainSuggestionConfig.newSuggestionChains
        );
      }
    };

    const closeMenu = () => {
      setIsOpenMenu(false);
    };

    return (
      <Fragment>
        <HeaderLayout
          title={""}
          left={
            <React.Fragment>
              <Gutter size="0.75rem" />
              <Box>
                <XAxis alignY="center">
                  <Styles.NameContainer
                    ref={accountSwitchFloatingModal.refs.setReference}
                    onClick={() => {
                      setIsOpenAccountSwitchModal(true);
                    }}
                  >
                    <NameHoverArea
                      onHover={setIsNameHover}
                      isHover={isNameHover}
                      onClick={() => {
                        setIsOpenAccountSwitchModal(true);
                      }}
                    >
                      <NameIcon name={name} />
                      <Gutter size="0.5rem" />
                    </NameHoverArea>
                    <Box alignY="center">
                      <XAxis alignY="center">
                        <Box
                          position="relative"
                          style={{
                            paddingRight: "1.75rem",
                          }}
                        >
                          <NameHoverArea
                            onHover={setIsNameHover}
                            isHover={isNameHover}
                            onClick={() => {
                              setIsOpenAccountSwitchModal(true);
                            }}
                          >
                            <Subtitle4
                              color={
                                theme.mode === "light"
                                  ? ColorPalette["gray-700"]
                                  : ColorPalette["white"]
                              }
                            >
                              {name}
                            </Subtitle4>
                          </NameHoverArea>
                          <Box
                            ref={depositFloatingModal.refs.setReference}
                            position="absolute"
                            alignY="center"
                            style={{
                              top: "50%",
                              right: "0",
                              transform: "translateY(-50%)",
                            }}
                          >
                            <IconButton
                              padding="0.375rem"
                              hoverColor={
                                theme.mode === "light"
                                  ? ColorPalette["gray-100"]
                                  : ColorPalette["gray-600"]
                              }
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsOpenDepositModal(true);
                              }}
                            >
                              <CopyOutlineIcon
                                width="0.75rem"
                                height="0.75rem"
                                color={ColorPalette["gray-300"]}
                              />
                            </IconButton>
                          </Box>
                        </Box>
                      </XAxis>

                      <VerticalCollapseTransition
                        collapsed={!isShowTotalPrice}
                        width="15rem"
                      >
                        <NameHoverArea
                          onHover={setIsNameHover}
                          isHover={isNameHover}
                          onClick={() => {
                            setIsOpenAccountSwitchModal(true);
                          }}
                        >
                          <Subtitle4
                            color={
                              theme.mode === "light"
                                ? ColorPalette["gray-700"]
                                : ColorPalette["white"]
                            }
                          >
                            {totalPrice?.toString()}
                          </Subtitle4>
                        </NameHoverArea>
                      </VerticalCollapseTransition>
                    </Box>
                  </Styles.NameContainer>
                </XAxis>
              </Box>
            </React.Fragment>
          }
          right={
            <Columns sum={1} alignY="center" gutter="0.875rem">
              <ConnectedEcosystems />
              <Tooltip
                hideArrow={true}
                borderRadius="1.5rem"
                borderColor={
                  theme.mode === "light"
                    ? ColorPalette["gray-100"]
                    : ColorPalette["gray-500"]
                }
                backgroundColor={
                  theme.mode === "light"
                    ? ColorPalette["gray-10"]
                    : ColorPalette["gray-600"]
                }
                content={
                  <Box width="17rem" padding="0.375rem">
                    <YAxis>
                      <Subtitle3
                        color={
                          theme.mode === "light"
                            ? ColorPalette["gray-700"]
                            : ColorPalette["white"]
                        }
                      >
                        <FormattedMessage
                          id="page.main.layouts.header.new-chain.title"
                          values={{
                            chains:
                              uiConfigStore.newChainSuggestionConfig.newSuggestionChains
                                .map((chain) => {
                                  return chainStore.getChain(chain).chainName;
                                })
                                .join(", "),
                          }}
                        />
                      </Subtitle3>
                      <Gutter size="0.75rem" />
                      <Body2
                        color={
                          theme.mode === "light"
                            ? ColorPalette["gray-300"]
                            : ColorPalette["gray-200"]
                        }
                      >
                        <FormattedMessage
                          id="page.main.layouts.header.new-chain.paragraph"
                          values={{
                            count:
                              uiConfigStore.newChainSuggestionConfig
                                .newSuggestionChains.length,
                          }}
                        />
                      </Body2>
                      <Gutter size="0.75rem" />
                      <YAxis alignX="right">
                        <Button
                          size="small"
                          color="secondary"
                          text={intl.formatMessage({
                            id: "page.main.layouts.header.new-chain.button",
                          })}
                          onClick={openMenu}
                        />
                      </YAxis>
                    </YAxis>
                  </Box>
                }
                filter={
                  theme.mode === "light"
                    ? "drop-shadow(0px 1px 10px rgba(43, 39, 55, 0.20))"
                    : undefined
                }
                enabled={
                  uiConfigStore.newChainSuggestionConfig.newSuggestionChains
                    .length > 0
                }
                isAlwaysOpen={
                  uiConfigStore.newChainSuggestionConfig.newSuggestionChains
                    .length > 0
                }
              >
                <Box onClick={openMenu} cursor="pointer">
                  <FloatingMenuBar
                    isOpen={isOpenMenu}
                    openMenu={openMenu}
                    closeMenu={closeMenu}
                  />
                </Box>
              </Tooltip>
            </Columns>
          }
          {...otherProps}
        >
          {children}
        </HeaderLayout>
        <AccountSwitchFloatModal
          isOpen={isOpenAccountSwitchModal}
          closeModal={() => setIsOpenAccountSwitchModal(false)}
          floating={accountSwitchFloatingModal}
        />
        <FloatModal
          isOpen={isOpenDepositModal}
          close={() => setIsOpenDepositModal(false)}
        >
          <DepositFloatingModal
            close={() => setIsOpenDepositModal(false)}
            floating={depositFloatingModal}
          />
        </FloatModal>
      </Fragment>
    );
  },
  {
    forwardRef: true,
  }
);

const NameIcon = ({ name }: { name: string }) => {
  const theme = useTheme();

  return (
    <Box
      alignX="center"
      alignY="center"
      width="1.5rem"
      height="1.5rem"
      borderRadius="9999px"
      backgroundColor={
        theme.mode === "light"
          ? ColorPalette["gray-100"]
          : ColorPalette["gray-550"]
      }
    >
      <Caption1
        color={
          theme.mode === "light"
            ? ColorPalette["gray-300"]
            : ColorPalette["gray-200"]
        }
      >
        {name.length > 0 ? name[0] : ""}
      </Caption1>
    </Box>
  );
};
