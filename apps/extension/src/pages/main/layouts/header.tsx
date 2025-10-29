import React, {
  Fragment,
  PropsWithChildren,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { Columns } from "../../../components/column";
import { Box } from "../../../components/box";
import { CopyOutlineIcon } from "../../../components/icon";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { HeaderLayout } from "../../../layouts/header";
import styled, { useTheme } from "styled-components";
import { HeaderProps } from "../../../layouts/header/types";
import { ColorPalette } from "../../../styles";
import { XAxis } from "../../../components/axis";
import { Caption1, Subtitle4 } from "../../../components/typography";
import { Gutter } from "../../../components/gutter";
import { ConnectedEcosystems } from "../components/connected-ecosystems";
import { COMMON_HOVER_OPACITY } from "../../../styles/constant";
import { IconButton } from "../../../components/icon-button";
import { FloatingMenuBar } from "../components/floating-menu-bar";

const Styles = {
  NameContainer: styled.div`
    display: flex;
    cursor: pointer;
    align-items: center;
    justify-content: center;

    transition: opacity 0.1s ease-in-out;

    &:hover {
      opacity: ${COMMON_HOVER_OPACITY};
    }
  `,
};

export interface MainHeaderLayoutRef {
  toggleSideMenu: () => void;
  openSideMenu: () => void;
  closeSideMenu: () => void;
}

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
  >,
  MainHeaderLayoutRef
>(
  (props, ref) => {
    const { children, ...otherProps } = props;

    const { uiConfigStore, keyRingStore } = useStore();

    // 여기도 다음 pr에서 사용
    // const icnsPrimaryName = (() => {
    //   if (
    //     uiConfigStore.icnsInfo &&
    //     chainStore.hasChain(uiConfigStore.icnsInfo.chainId)
    //   ) {
    //     const queries = queriesStore.get(uiConfigStore.icnsInfo.chainId);
    //     const icnsQuery = queries.icns.queryICNSNames.getQueryContract(
    //       uiConfigStore.icnsInfo.resolverContractAddress,
    //       accountStore.getAccount(uiConfigStore.icnsInfo.chainId).bech32Address
    //     );

    //     return icnsQuery.primaryName.split(".")[0];
    //   }
    // })();

    const theme = useTheme();
    const name = useMemo(() => {
      return keyRingStore.selectedKeyInfo?.name || "Keplr Account";
    }, [keyRingStore.selectedKeyInfo?.name]);

    const [isOpenMenu, setIsOpenMenu] = React.useState(false);

    useEffect(() => {
      // showNewSidePanelHeaderTop이 true면서 사이드 메뉴가 열렸으면 당연히 false로 바꿔줘야함
      if (isOpenMenu && uiConfigStore.showNewSidePanelHeaderTop) {
        uiConfigStore.setShowNewSidePanelHeaderTop(false);
      }
    }, [isOpenMenu, uiConfigStore]);

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

    const openMenuRef = useRef(openMenu);
    openMenuRef.current = openMenu;
    const closeMenuRef = useRef(closeMenu);
    closeMenuRef.current = closeMenu;

    useImperativeHandle(
      ref,
      () => ({
        toggleSideMenu: () => {
          if (isOpenMenu) {
            closeMenuRef.current();
          } else {
            openMenuRef.current();
          }
        },
        openSideMenu: () => {
          openMenuRef.current();
        },
        closeSideMenu: () => {
          closeMenuRef.current();
        },
      }),
      [isOpenMenu]
    );

    return (
      <Fragment>
        <HeaderLayout
          title={""}
          left={
            <React.Fragment>
              <Gutter size="0.75rem" />
              <XAxis alignY="center">
                <Styles.NameContainer
                  onClick={() => {
                    //TODO 어카운트 변경 모달
                  }}
                >
                  <NameIcon name={name} />
                  <Gutter size="0.5rem" />
                  <Subtitle4
                    color={
                      theme.mode === "light"
                        ? ColorPalette["gray-700"]
                        : ColorPalette["white"]
                    }
                  >
                    {name}
                  </Subtitle4>
                </Styles.NameContainer>

                <Gutter size="0.125rem" />
                <IconButton
                  padding="0.375rem"
                  hoverColor={
                    theme.mode === "light"
                      ? ColorPalette["gray-100"]
                      : ColorPalette["gray-600"]
                  }
                  onClick={() => {
                    //TODO 주소모달
                  }}
                >
                  <CopyOutlineIcon
                    width="0.75rem"
                    height="0.75rem"
                    color={ColorPalette["gray-300"]}
                  />
                </IconButton>
              </XAxis>
              {/* 뉴체인 공지 추후 구현 필요 */}
              {/* 일종의 padding left인데 cursor를 가지게 하면서 밑에서 tooltip도 함께 사용하기 위해서 다른 Box로 분리되어있음 */}
              {/* <Box>
                <Tooltip
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
                  backgroundColor={
                    theme.mode === "light"
                      ? ColorPalette["white"]
                      : ColorPalette["gray-500"]
                  }
                  hideBorder={theme.mode === "light"}
                  filter={
                    theme.mode === "light"
                      ? "drop-shadow(0px 1px 10px rgba(43, 39, 55, 0.20))"
                      : undefined
                  }
                  enabled={
                    true
                    // uiConfigStore.newChainSuggestionConfig.newSuggestionChains
                    //   .length > 0
                  }
                  isAlwaysOpen={
                    uiConfigStore.newChainSuggestionConfig.newSuggestionChains
                      .length > 0
                  }
                >
                  <Box onClick={openMenu} cursor="pointer">
                    <MenuIcon />
                  </Box>
                </Tooltip>
              </Box> */}
            </React.Fragment>
          }
          right={
            <Columns sum={1} alignY="center" gutter="0.875rem">
              <ConnectedEcosystems />
              <FloatingMenuBar
                isOpen={isOpenMenu}
                openMenu={openMenu}
                closeMenu={closeMenu}
              />
              {/* <ProfileButton /> */}
            </Columns>
          }
          {...otherProps}
        >
          {children}
        </HeaderLayout>
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
