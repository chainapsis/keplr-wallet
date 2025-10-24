import React, {
  PropsWithChildren,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { Columns } from "../../../components/column";
import { Box } from "../../../components/box";
import { Tooltip } from "../../../components/tooltip";
import { Image } from "../../../components/image";
import { MenuIcon } from "../../../components/icon";
import { ProfileButton } from "../../../layouts/header/components";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { HeaderLayout } from "../../../layouts/header";
import { useTheme } from "styled-components";
import { Modal } from "../../../components/modal";
import { MenuBar } from "../components";
import { HeaderProps } from "../../../layouts/header/types";
import { ColorPalette } from "../../../styles";
import { YAxis } from "../../../components/axis";
import { Body2, Subtitle3 } from "../../../components/typography";
import { FormattedMessage, useIntl } from "react-intl";
import { Gutter } from "../../../components/gutter";
import { Button } from "../../../components/button";
import { ExtensionKVStore } from "@keplr-wallet/common";
import { ConnectedEcosystems } from "../components/connected-ecosystems";

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

    const {
      keyRingStore,
      uiConfigStore,
      chainStore,
      accountStore,
      queriesStore,
    } = useStore();

    const icnsPrimaryName = (() => {
      if (
        uiConfigStore.icnsInfo &&
        chainStore.hasModularChain(uiConfigStore.icnsInfo.chainId)
      ) {
        const queries = queriesStore.get(uiConfigStore.icnsInfo.chainId);
        const icnsQuery = queries.icns.queryICNSNames.getQueryContract(
          uiConfigStore.icnsInfo.resolverContractAddress,
          accountStore.getAccount(uiConfigStore.icnsInfo.chainId).bech32Address
        );

        return icnsQuery.primaryName.split(".")[0];
      }
    })();

    const theme = useTheme();
    const intl = useIntl();

    const [isOpenMenu, setIsOpenMenu] = React.useState(false);

    const [
      showSidePanelRecommendationTooltip,
      setShowSidePanelRecommendationTooltip,
    ] = React.useState(false);

    useEffect(() => {
      const kvStore = new ExtensionKVStore(
        "_side_menu_side_panel_recommendation_tooltip"
      );
      kvStore.get<boolean>("hasSeen").then((hasSeen) => {
        if (hasSeen == null) {
          // 한번도 side menu가 열린적이 없으면 tooltip을 보여준다.
          setShowSidePanelRecommendationTooltip(true);
        }
      });
    }, []);
    const prevIsOpenMenu = useRef(isOpenMenu);
    useEffect(() => {
      if (showSidePanelRecommendationTooltip && isOpenMenu) {
        // 한번이라도 side menu가 열린적이 있으면 tooltip을 보여주지 않는다.
        const kvStore = new ExtensionKVStore(
          "_side_menu_side_panel_recommendation_tooltip"
        );
        kvStore.set("hasSeen", true);
      }

      if (isOpenMenu !== prevIsOpenMenu.current) {
        // side menu가 닫히는 순간에 tooltip을 없앤다.
        if (
          prevIsOpenMenu.current &&
          !isOpenMenu &&
          showSidePanelRecommendationTooltip
        ) {
          setShowSidePanelRecommendationTooltip(false);
        }
        prevIsOpenMenu.current = isOpenMenu;
      }
    }, [showSidePanelRecommendationTooltip, isOpenMenu]);

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
      <HeaderLayout
        title={(() => {
          const name = keyRingStore.selectedKeyInfo?.name || "Keplr Account";

          if (icnsPrimaryName !== "") {
            return (
              <Columns sum={1} alignY="center" gutter="0.25rem">
                <Box>{name}</Box>

                <Tooltip
                  content={
                    <div style={{ whiteSpace: "nowrap" }}>
                      ICNS : {icnsPrimaryName}
                    </div>
                  }
                >
                  <Image
                    alt="icns-icon"
                    src={require(theme.mode === "light"
                      ? "../../../public/assets/img/icns-icon-light.png"
                      : "../../../public/assets/img/icns-icon.png")}
                    style={{ width: "1rem", height: "1rem" }}
                  />
                </Tooltip>
              </Columns>
            );
          }

          return name;
        })()}
        left={
          <React.Fragment>
            {/* 일종의 padding left인데 cursor를 가지게 하면서 밑에서 tooltip도 함께 사용하기 위해서 다른 Box로 분리되어있음 */}
            <Box
              width="1rem"
              height="1.5rem"
              cursor="pointer"
              onClick={openMenu}
            />
            <Box>
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
                                  return chainStore.getModularChain(chain)
                                    .chainName;
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
                  uiConfigStore.newChainSuggestionConfig.newSuggestionChains
                    .length > 0
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
            </Box>
          </React.Fragment>
        }
        right={
          <Columns sum={1} alignY="center" gutter="0.875rem">
            <ConnectedEcosystems />
            <ProfileButton />
          </Columns>
        }
        {...otherProps}
      >
        {children}

        <Modal
          isOpen={isOpenMenu}
          align="left"
          close={() => setIsOpenMenu(false)}
        >
          <MenuBar
            isOpen={isOpenMenu}
            close={() => setIsOpenMenu(false)}
            showSidePanelRecommendationTooltip={
              showSidePanelRecommendationTooltip
            }
          />
        </Modal>
      </HeaderLayout>
    );
  },
  {
    forwardRef: true,
  }
);
