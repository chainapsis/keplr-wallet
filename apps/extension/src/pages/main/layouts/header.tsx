import React, {
  FunctionComponent,
  PropsWithChildren,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { Columns } from "../../../components/column";
import { Box } from "../../../components/box";
import { Tooltip } from "../../../components/tooltip";
import { ChainImageFallback, Image } from "../../../components/image";
import { CheckIcon, MenuIcon } from "../../../components/icon";
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
import { getActiveTabOrigin } from "../../../utils/browser-api";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { BACKGROUND_PORT } from "@keplr-wallet/router";
import {
  GetCurrentChainIdForEVMMsg,
  UpdateCurrentChainIdForEVMMsg,
} from "@keplr-wallet/background";
import {
  autoPlacement,
  autoUpdate,
  offset,
  useFloating,
} from "@floating-ui/react-dom";
import SimpleBar from "simplebar-react";
import { ExtensionKVStore } from "@keplr-wallet/common";

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
      | "bottomButton"
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
        chainStore.hasChain(uiConfigStore.icnsInfo.chainId)
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

    const [currentChainIdForEVM, setCurrentChainIdForEVM] = React.useState<
      string | undefined
    >();
    const [activeTabOrigin, setActiveTabOrigin] = React.useState<
      string | undefined
    >();
    useEffect(() => {
      const updateCurrentChainIdForEVM = async () => {
        const activeTabOrigin = await getActiveTabOrigin();

        if (activeTabOrigin) {
          const msg = new GetCurrentChainIdForEVMMsg(activeTabOrigin);
          const newCurrentChainIdForEVM =
            await new InExtensionMessageRequester().sendMessage(
              BACKGROUND_PORT,
              msg
            );
          setCurrentChainIdForEVM(newCurrentChainIdForEVM);
          setActiveTabOrigin(activeTabOrigin);
        } else {
          setCurrentChainIdForEVM(undefined);
          setActiveTabOrigin(undefined);
        }
      };

      browser.tabs.onActivated.addListener(updateCurrentChainIdForEVM);
      updateCurrentChainIdForEVM();
      // Update current chain id for EVM every second.
      // TODO: Make it sync with `chainChanged` event.
      const intervalId = setInterval(updateCurrentChainIdForEVM, 1000);

      return () => {
        browser.tabs.onActivated.removeListener(updateCurrentChainIdForEVM);
        clearInterval(intervalId);
      };
    }, []);
    const [isHoveredCurrenctChainIcon, setIsHoveredCurrenctChainIcon] =
      React.useState(false);
    const [isOpenCurrentChainDropdown, setIsOpenCurrentChainDropdown] =
      React.useState(false);
    const evmChainInfos = chainStore.chainInfos.filter((chainInfo) =>
      chainStore.isEvmChain(chainInfo.chainId)
    );

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
                        <FormattedMessage id="page.main.layouts.header.new-chain.paragraph" />
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
            {currentChainIdForEVM != null && activeTabOrigin != null && (
              <EVMChainSelector
                isOpen={isOpenCurrentChainDropdown}
                close={() => setIsOpenCurrentChainDropdown(false)}
                items={evmChainInfos.map((chainInfo) => ({
                  key: chainInfo.chainId,
                  content: (
                    <Columns sum={1} alignY="center" gutter="0.5rem">
                      <ChainImageFallback chainInfo={chainInfo} size="2rem" />
                      <Subtitle3>{chainInfo.chainName}</Subtitle3>
                    </Columns>
                  ),
                  onSelect: async (key) => {
                    const msg = new UpdateCurrentChainIdForEVMMsg(
                      activeTabOrigin,
                      key
                    );
                    await new InExtensionMessageRequester().sendMessage(
                      BACKGROUND_PORT,
                      msg
                    );
                    setCurrentChainIdForEVM(key);
                  },
                }))}
                selectedItemKey={currentChainIdForEVM}
                activeTabOrigin={activeTabOrigin}
              >
                <Box
                  borderRadius="99999px"
                  position="relative"
                  cursor="pointer"
                  onHoverStateChange={setIsHoveredCurrenctChainIcon}
                  onClick={() => setIsOpenCurrentChainDropdown(true)}
                >
                  <ChainImageFallback
                    chainInfo={chainStore.getChain(currentChainIdForEVM)}
                    size="1.25rem"
                    style={{ opacity: isHoveredCurrenctChainIcon ? 0.8 : 1 }}
                  />
                  <Box
                    backgroundColor={
                      theme.mode === "light"
                        ? ColorPalette["light-gradient"]
                        : ColorPalette["gray-700"]
                    }
                    width="0.625rem"
                    height="0.625rem"
                    borderRadius="99999px"
                    position="absolute"
                    style={{ right: "-3px", bottom: "-2px" }}
                    alignX="center"
                    alignY="center"
                  >
                    <Box
                      backgroundColor={ColorPalette["green-400"]}
                      width="0.375rem"
                      height="0.375rem"
                      borderRadius="99999px"
                    />
                  </Box>
                </Box>
              </EVMChainSelector>
            )}
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

const EVMChainSelector: FunctionComponent<
  PropsWithChildren<{
    isOpen: boolean;
    close: () => void;
    items: {
      key: string;
      content: React.ReactNode;
      onSelect: (key: string) => void;
    }[];
    selectedItemKey: string;
    activeTabOrigin: string;
  }>
> = observer(
  ({ children, isOpen, close, items, selectedItemKey, activeTabOrigin }) => {
    const { x, y, strategy, refs } = useFloating({
      placement: "bottom-end",
      middleware: [
        autoPlacement({
          allowedPlacements: ["bottom-end"],
        }),
        offset({
          mainAxis: 10,
          crossAxis: 10,
        }),
      ],
      whileElementsMounted: autoUpdate,
      open: isOpen,
    });

    const closeRef = useRef(close);
    closeRef.current = close;
    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        const floatingRef = refs.floating;
        if (
          floatingRef.current &&
          "contains" in floatingRef.current &&
          !floatingRef.current.contains(event.target as Node)
        ) {
          closeRef.current();
        }
      }
      document.addEventListener("mousedown", handleClickOutside);

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [refs.floating]);

    return (
      <React.Fragment>
        <div ref={refs.setReference}>{children}</div>
        {isOpen && (
          <div
            ref={refs.setFloating}
            style={{
              position: strategy,
              top: y ?? 0,
              left: x ?? 0,

              minWidth: "19rem",
              backgroundColor: ColorPalette["gray-600"],
              borderRadius: "0.375rem",
              borderStyle: "solid",
              borderWidth: "1px",
              borderColor: ColorPalette["gray-500"],
            }}
          >
            <Box
              alignX="left"
              alignY="center"
              paddingX="1rem"
              paddingY="1.25rem"
              color={ColorPalette["gray-200"]}
              backgroundColor={ColorPalette["gray-600"]}
              style={{
                borderTopLeftRadius: "0.375rem",
                borderTopRightRadius: "0.375rem",
                borderBottomStyle: "solid",
                borderBottomWidth: "1px",
                borderBottomColor: ColorPalette["gray-500"],
              }}
            >
              <Columns sum={1} alignY="center" gutter="0.5rem">
                <Box
                  backgroundColor={ColorPalette["green-400"]}
                  width="0.375rem"
                  height="0.375rem"
                  borderRadius="99999px"
                />
                <Body2>{activeTabOrigin}</Body2>
              </Columns>
            </Box>
            <SimpleBar
              style={{
                display: "flex",
                flexDirection: "column",
                maxHeight: "16rem",
                overflowY: "auto",
              }}
            >
              {items.map((item) => {
                const isSelectedItem = selectedItemKey === item.key;

                return (
                  <Box
                    key={item.key}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                    paddingX="1rem"
                    paddingY="0.75rem"
                    cursor="pointer"
                    color={ColorPalette["white"]}
                    backgroundColor={
                      ColorPalette[isSelectedItem ? "gray-650" : "gray-600"]
                    }
                    hover={{
                      backgroundColor: ColorPalette["gray-550"],
                    }}
                    onClick={(e) => {
                      e.preventDefault();

                      item.onSelect(item.key);

                      close();
                    }}
                  >
                    {item.content}
                    {isSelectedItem && <CheckIcon />}
                  </Box>
                );
              })}
            </SimpleBar>
            <Box
              alignX="left"
              alignY="center"
              paddingX="1rem"
              paddingY="1.25rem"
              color={ColorPalette["gray-200"]}
              backgroundColor={ColorPalette["gray-600"]}
              style={{
                borderBottomLeftRadius: "0.375rem",
                borderBottomRightRadius: "0.375rem",
              }}
            >
              <Body2>
                {"EVM compatible chains require users to"}
                <br /> {"manually switch between networks in"}
                <br />
                {"their wallets."}
              </Body2>
            </Box>
          </div>
        )}
      </React.Fragment>
    );
  }
);
