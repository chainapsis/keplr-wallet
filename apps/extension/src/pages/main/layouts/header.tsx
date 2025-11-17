import React, {
  Fragment,
  PropsWithChildren,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Columns } from "../../../components/column";
import { Box } from "../../../components/box";
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
  Caption2,
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
import { Image } from "../../../components/image";
import { useGetIcnsName } from "../../../hooks/use-get-icns-name";

const Styles = {
  NameContainer: styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
  `,

  NameHoverArea: styled(Box)<{ isHover: boolean }>`
    display: flex;
    flex-direction: row;
    transition: opacity 0.1s ease-in-out;
    cursor: pointer;

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
  style,
}: {
  children: React.ReactNode;
  onClick: () => void;
  onHover: (isHover: boolean) => void;
  isHover: boolean;
  style?: React.CSSProperties;
}) => {
  return (
    <Styles.NameHoverArea
      onClick={onClick}
      isHover={isHover}
      onHoverStateChange={onHover}
      style={style}
    >
      {children}
    </Styles.NameHoverArea>
  );
};

const useHeaderTotalPriceVisibility = ({
  forcedIsShowTotalPrice,
}: {
  forcedIsShowTotalPrice?: boolean;
}): boolean => {
  const { uiConfigStore, mainHeaderAnimationStore } = useStore();
  const location = useLocation();
  const isNotMainPage = location.pathname !== "/";
  const isPrivacyMode = uiConfigStore.isPrivacyMode;
  const trigger = mainHeaderAnimationStore.triggerMainHeaderPriceAnimation;

  const isShowTotalPriceFinally = useMemo(() => {
    if (isPrivacyMode) {
      return false;
    }
    if (forcedIsShowTotalPrice) {
      return forcedIsShowTotalPrice;
    }
    return isNotMainPage;
  }, [forcedIsShowTotalPrice, isNotMainPage, isPrivacyMode]);

  // 해당 상태로 UI상 보여줄지를 결정하기 때문에
  // 페이지 이동시 show or hide 애니메이션을 위해서 존재함
  const [isShowTotalPrice, setIsShowTotalPrice] = useState<boolean>(() => {
    if (isPrivacyMode) {
      return false;
    }
    if (trigger === "hide") {
      return true;
    }
    if (trigger === "show" && isShowTotalPriceFinally) {
      return false;
    }
    return isShowTotalPriceFinally;
  });

  // 여기서 어떻게 isShowTotalPrice를 업데이트 할지 결정한다.
  // 기본적으로 trigger가 hide이면 isShowTotalPrice가 true -> false 순으로 변경된다.
  // trigger가 show이고 isShowTotalPriceFinally가 true이면 isShowTotalPrice가 false -> true 순으로 변경된다.
  // 그리고 한번 실행 되고 나면 임의의 변경 없이 isShowTotalPriceFinally 상태를 따르도록 한다.
  useEffect(() => {
    if (trigger === "not-triggered") {
      setIsShowTotalPrice(isShowTotalPriceFinally);
      return;
    }

    if (isPrivacyMode) {
      setIsShowTotalPrice(false);
      mainHeaderAnimationStore.resetTriggerForMainHeaderPrice();
      return;
    }

    if (trigger === "hide") {
      const timer = setTimeout(() => {
        setIsShowTotalPrice(false);
        mainHeaderAnimationStore.resetTriggerForMainHeaderPrice();
      }, 0);
      return () => {
        clearTimeout(timer);
      };
    }

    if (!isShowTotalPriceFinally) {
      setIsShowTotalPrice(isShowTotalPriceFinally);
      mainHeaderAnimationStore.resetTriggerForMainHeaderPrice();
      return;
    }

    const timer = setTimeout(() => {
      setIsShowTotalPrice(true);
      mainHeaderAnimationStore.resetTriggerForMainHeaderPrice();
    }, 0);
    return () => {
      clearTimeout(timer);
    };
  }, [
    trigger,
    isShowTotalPriceFinally,
    isPrivacyMode,
    mainHeaderAnimationStore,
  ]);
  return isShowTotalPrice;
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

    const { uiConfigStore, keyRingStore, chainStore, accountStore } =
      useStore();
    const [isOpenAccountSwitchModal, setIsOpenAccountSwitchModal] =
      useState(false);

    const intl = useIntl();
    const [isNameHover, setIsNameHover] = useState(false);
    const isShowTotalPrice = useHeaderTotalPriceVisibility({
      forcedIsShowTotalPrice: props.isShowTotalPrice,
    });

    const icnsPrimaryName = useGetIcnsName(
      uiConfigStore.icnsInfo?.chainId
        ? accountStore.getAccount(uiConfigStore.icnsInfo.chainId).bech32Address
        : undefined
    );

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
                          <XAxis alignY="center">
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
                                style={{
                                  maxWidth: "8.75rem",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {name}
                              </Subtitle4>
                            </NameHoverArea>

                            {icnsPrimaryName && (
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
                                    ? "../../../public/assets/img/icns-icon-light.png"
                                    : "../../../public/assets/img/icns-icon.png")}
                                  style={{
                                    width: "1rem",
                                    height: "1rem",
                                    marginLeft: "0.25rem",
                                  }}
                                />
                              </Tooltip>
                            )}
                          </XAxis>
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
                              <_CopyOutlineIcon
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
                                : ColorPalette["gray-300"]
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

const _CopyOutlineIcon = ({ color }: { color: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
    >
      <path
        d="M2.40034 3.78997C2.40034 3.44255 2.51785 3.14515 2.75288 2.89775C2.98791 2.65035 3.27045 2.52665 3.60049 2.52665L10.8014 2.52665C11.1315 2.52665 11.414 2.65035 11.649 2.89775C11.8841 3.14515 12.0016 3.44255 12.0016 3.78997L12.0016 10.7382C12.0016 11.0857 11.8841 11.3831 11.649 11.6305C11.414 11.8779 11.1315 12.0016 10.8014 12.0016L3.60049 12.0016C3.27045 12.0016 2.98791 11.8779 2.75288 11.6305C2.51785 11.3831 2.40034 11.0857 2.40034 10.7382L2.40034 3.78997ZM3.60049 3.78997L3.60049 10.7382L10.8014 10.7382L10.8014 3.78997L3.60049 3.78997ZM2.48508e-05 1.26332C2.48356e-05 0.915909 0.117539 0.618502 0.35257 0.371101C0.587601 0.1237 0.870138 3.80339e-08 1.20018 5.24605e-08L9.0012 3.93454e-07C9.17122 4.00886e-07 9.31374 0.0605346 9.42875 0.181603C9.54377 0.302671 9.60127 0.452691 9.60127 0.631662C9.60127 0.810632 9.54377 0.960652 9.42875 1.08172C9.31374 1.20279 9.17122 1.26332 9.0012 1.26332L1.20018 1.26332L1.20018 8.84326C1.20018 9.02223 1.14267 9.17225 1.02766 9.29332C0.912644 9.41438 0.770125 9.47492 0.600103 9.47492C0.430081 9.47492 0.287563 9.41438 0.172548 9.29332C0.0575327 9.17225 2.51899e-05 9.02223 2.51821e-05 8.84326L2.48508e-05 1.26332Z"
        fill={color}
      />
    </svg>
  );
};
