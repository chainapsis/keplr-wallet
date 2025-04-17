import React, {
  FunctionComponent,
  PropsWithChildren,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { Columns } from "../../../components/column";
import { Box, BoxProps } from "../../../components/box";
import { Tooltip } from "../../../components/tooltip";
import { ChainImageFallback, Image } from "../../../components/image";
import {
  ArrowLeftIcon,
  CheckIcon,
  MenuIcon,
  RightArrowIcon,
} from "../../../components/icon";
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
import {
  Body2,
  Body3,
  Caption1,
  Subtitle3,
} from "../../../components/typography";
import { FormattedMessage, useIntl } from "react-intl";
import { Gutter } from "../../../components/gutter";
import { Button } from "../../../components/button";
import { getActiveTabOrigin } from "../../../utils/browser-api";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { BACKGROUND_PORT } from "@keplr-wallet/router";
import {
  GetCurrentChainIdForEVMMsg,
  UpdateCurrentChainIdForEVMMsg,
  GetCurrentChainIdForStarknetMsg,
  UpdateCurrentChainIdForStarknetMsg,
  GetCurrentChainIdForBitcoinMsg,
  UpdateCurrentChainIdForBitcoinMsg,
  GetPreferredBitcoinPaymentTypeMsg,
  SetPreferredBitcoinPaymentTypeMsg,
} from "@keplr-wallet/background";
import { autoUpdate, offset, shift, useFloating } from "@floating-ui/react-dom";
import SimpleBar from "simplebar-react";
import { ExtensionKVStore } from "@keplr-wallet/common";
import { SupportedPaymentType as BitcoinPaymentType } from "@keplr-wallet/types";
import { Bech32Address } from "@keplr-wallet/cosmos";

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
    const [
      isOpenCurrentChainSelectorForEVM,
      setIsOpenCurrentChainSelectorForEVM,
    ] = React.useState(false);
    const [
      isHoveredCurrenctChainIconForEVM,
      setIsHoveredCurrenctChainIconForEVM,
    ] = React.useState(false);
    const evmChainInfos = chainStore.chainInfos.filter((chainInfo) =>
      chainStore.isEvmChain(chainInfo.chainId)
    );

    const [currentChainIdForStarknet, setCurrentChainIdForStarknet] =
      React.useState<string | undefined>();
    const [
      isOpenCurrentChainSelectorForStarknet,
      setIsOpenCurrentChainSelectorForStarknet,
    ] = React.useState(false);
    const [
      isHoveredCurrenctChainIconForStarknet,
      setIsHoveredCurrenctChainIconForStarknet,
    ] = React.useState(false);
    const starknetChainInfos = chainStore.modularChainInfos.filter(
      (modularChainInfo) => "starknet" in modularChainInfo
    );

    const [currentChainIdForBitcoin, setCurrentChainIdForBitcoin] =
      React.useState<string | undefined>();
    const [
      isOpenCurrentChainSelectorForBitcoin,
      setIsOpenCurrentChainSelectorForBitcoin,
    ] = React.useState(false);
    const [
      isHoveredCurrenctChainIconForBitcoin,
      setIsHoveredCurrenctChainIconForBitcoin,
    ] = React.useState(false);
    const bitcoinChainInfos = chainStore.groupedModularChainInfos.filter(
      (modularChainInfo) => "bitcoin" in modularChainInfo
    );
    const currentBitcoinChainInfo = bitcoinChainInfos.find(
      (chainInfo) =>
        "bitcoin" in chainInfo &&
        chainInfo.bitcoin.chainId === currentChainIdForBitcoin
    );

    const [preferredPaymentTypeForBitcoin, setPreferredPaymentTypeForBitcoin] =
      React.useState<BitcoinPaymentType | undefined>();

    const [activeTabOrigin, setActiveTabOrigin] = React.useState<
      string | undefined
    >();

    const [addressConfigHover, setAddressConfigHover] = React.useState(false);
    const [displayAddressTypeSelector, setDisplayAddressTypeSelector] =
      React.useState(false);

    useEffect(() => {
      const updateCurrentChainId = async () => {
        const activeTabOrigin = await getActiveTabOrigin();

        if (activeTabOrigin) {
          const msgForEVM = new GetCurrentChainIdForEVMMsg(activeTabOrigin);
          const msgForStarknet = new GetCurrentChainIdForStarknetMsg(
            activeTabOrigin
          );
          const msgForBitcoin = new GetCurrentChainIdForBitcoinMsg(
            activeTabOrigin
          );
          const msgForBitcoinPaymentType =
            new GetPreferredBitcoinPaymentTypeMsg();

          const newCurrentChainIdForEVM =
            await new InExtensionMessageRequester().sendMessage(
              BACKGROUND_PORT,
              msgForEVM
            );
          const newCurrentChainIdForStarknet =
            await new InExtensionMessageRequester().sendMessage(
              BACKGROUND_PORT,
              msgForStarknet
            );
          const newCurrentChainIdForBitcoin =
            await new InExtensionMessageRequester().sendMessage(
              BACKGROUND_PORT,
              msgForBitcoin
            );

          const newPreferredPaymentTypeForBitcoin =
            await new InExtensionMessageRequester().sendMessage(
              BACKGROUND_PORT,
              msgForBitcoinPaymentType
            );

          setCurrentChainIdForEVM(newCurrentChainIdForEVM);
          setCurrentChainIdForStarknet(newCurrentChainIdForStarknet);
          setCurrentChainIdForBitcoin(newCurrentChainIdForBitcoin);
          setPreferredPaymentTypeForBitcoin(newPreferredPaymentTypeForBitcoin);
          setActiveTabOrigin(activeTabOrigin);
        } else {
          setCurrentChainIdForEVM(undefined);
          setCurrentChainIdForStarknet(undefined);
          setCurrentChainIdForBitcoin(undefined);
          setPreferredPaymentTypeForBitcoin(undefined);
          setActiveTabOrigin(undefined);
        }
      };

      browser.tabs.onActivated.addListener(updateCurrentChainId);
      updateCurrentChainId();
      // Update current chain id for EVM and Starknet every second.
      // TODO: Make it sync with `chainChanged` event.
      const intervalId = setInterval(updateCurrentChainId, 1000);

      return () => {
        browser.tabs.onActivated.removeListener(updateCurrentChainId);
        clearInterval(intervalId);
      };
    }, []);

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
            {currentChainIdForBitcoin != null &&
              currentBitcoinChainInfo != null &&
              activeTabOrigin != null && (
                <ChainSelector
                  isOpen={isOpenCurrentChainSelectorForBitcoin}
                  close={() => {
                    setIsOpenCurrentChainSelectorForBitcoin(false);
                    setAddressConfigHover(false);
                    setDisplayAddressTypeSelector(false);
                  }}
                  items={
                    displayAddressTypeSelector
                      ? ["taproot", "native-segwit"].map((key) => ({
                          key,
                          content: (() => {
                            const address = accountStore.getAccount(
                              `${currentChainIdForBitcoin}:${key}`
                            )?.bitcoinAddress?.bech32Address;

                            return (
                              <Box>
                                <Subtitle3
                                  color={
                                    theme.mode === "light"
                                      ? ColorPalette["gray-700"]
                                      : ColorPalette["white"]
                                  }
                                >
                                  {key === "native-segwit"
                                    ? "Native SegWit"
                                    : "Taproot"}
                                </Subtitle3>
                                <Gutter size="0.25rem" />
                                {address && (
                                  <Body3 color={ColorPalette["gray-300"]}>
                                    {Bech32Address.shortenAddress(address, 15)}
                                  </Body3>
                                )}
                              </Box>
                            );
                          })(),
                          onSelect: async (key: string) => {
                            if (key !== "taproot" && key !== "native-segwit") {
                              return;
                            }

                            const msg = new SetPreferredBitcoinPaymentTypeMsg(
                              key as BitcoinPaymentType
                            );
                            await new InExtensionMessageRequester().sendMessage(
                              BACKGROUND_PORT,
                              msg
                            );

                            setPreferredPaymentTypeForBitcoin(key);
                          },
                        }))
                      : [
                          {
                            key: "label",
                            content: (
                              <Columns sum={1} alignY="center" gutter="0.5rem">
                                <Caption1>on</Caption1>
                              </Columns>
                            ),
                            onSelect: async () => {},
                            isDisabled: true,
                          },
                          ...bitcoinChainInfos.map((chainInfo) => ({
                            key:
                              "bitcoin" in chainInfo
                                ? chainInfo.bitcoin.chainId
                                : chainInfo.chainId,
                            content: (
                              <Columns sum={1} alignY="center" gutter="0.5rem">
                                <ChainImageFallback
                                  chainInfo={chainInfo}
                                  size="2rem"
                                />
                                <Subtitle3>{chainInfo.chainName}</Subtitle3>
                              </Columns>
                            ),
                            onSelect: async (key: string) => {
                              const msg = new UpdateCurrentChainIdForBitcoinMsg(
                                activeTabOrigin,
                                key
                              );
                              await new InExtensionMessageRequester().sendMessage(
                                BACKGROUND_PORT,
                                msg
                              );

                              setCurrentChainIdForBitcoin(key);
                            },
                          })),
                        ]
                  }
                  selectedItemKey={
                    displayAddressTypeSelector
                      ? preferredPaymentTypeForBitcoin ?? "taproot"
                      : currentChainIdForBitcoin
                  }
                  activeTabOrigin={activeTabOrigin}
                  headerContent={
                    displayAddressTypeSelector ? (
                      <Box
                        alignY="center"
                        alignX="center"
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          gap: "0.375rem",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          setDisplayAddressTypeSelector(false);
                        }}
                      >
                        <ArrowLeftIcon
                          width="1rem"
                          height="1rem"
                          color={ColorPalette["gray-200"]}
                        />
                        <Body2 color={ColorPalette["gray-300"]}>Back</Body2>
                      </Box>
                    ) : (
                      <Box width="100%">
                        <Caption1 color={ColorPalette["gray-300"]}>
                          Connected as
                        </Caption1>
                        <Gutter size="0.75rem" />
                        <Columns sum={1} alignY="center" gutter="0.5rem">
                          <Subtitle3
                            color={
                              theme.mode === "light"
                                ? ColorPalette["gray-700"]
                                : ColorPalette["white"]
                            }
                          >
                            {preferredPaymentTypeForBitcoin === "native-segwit"
                              ? "Native SegWit"
                              : "Taproot"}
                          </Subtitle3>
                          <div
                            style={{
                              flex: 1,
                            }}
                          />
                          {(() => {
                            const address = accountStore.getAccount(
                              `${currentChainIdForBitcoin}:${preferredPaymentTypeForBitcoin}`
                            )?.bitcoinAddress?.bech32Address;

                            if (address == null) {
                              return null;
                            }

                            return (
                              <Box
                                alignY="center"
                                alignX="center"
                                style={{
                                  display: "flex",
                                  flexDirection: "row",
                                  gap: "0.375rem",
                                  cursor: "pointer",
                                }}
                                onHoverStateChange={setAddressConfigHover}
                                onClick={() => {
                                  setDisplayAddressTypeSelector(true);
                                }}
                              >
                                <Body2
                                  color={
                                    addressConfigHover
                                      ? theme.mode === "light"
                                        ? ColorPalette["gray-200"]
                                        : ColorPalette["gray-300"]
                                      : theme.mode === "light"
                                      ? ColorPalette["gray-300"]
                                      : ColorPalette["gray-200"]
                                  }
                                >
                                  {Bech32Address.shortenAddress(address, 15)}
                                </Body2>
                                <RightArrowIcon
                                  width="1rem"
                                  height="1rem"
                                  color={
                                    addressConfigHover
                                      ? theme.mode === "light"
                                        ? ColorPalette["gray-100"]
                                        : ColorPalette["gray-400"]
                                      : theme.mode === "light"
                                      ? ColorPalette["gray-200"]
                                      : ColorPalette["gray-300"]
                                  }
                                />
                              </Box>
                            );
                          })()}
                        </Columns>
                      </Box>
                    )
                  }
                  footerContent={
                    displayAddressTypeSelector ? (
                      <Body2>
                        Select the address type you&apos;d like to use
                        <br />
                        with the web application.
                      </Body2>
                    ) : null
                  }
                  footerBoxPropsOverride={
                    displayAddressTypeSelector
                      ? undefined
                      : {
                          paddingY: "0.5rem",
                        }
                  }
                >
                  <Box
                    borderRadius="99999px"
                    position="relative"
                    cursor="pointer"
                    onHoverStateChange={setIsHoveredCurrenctChainIconForBitcoin}
                    onClick={() =>
                      setIsOpenCurrentChainSelectorForBitcoin(true)
                    }
                  >
                    <ChainImageFallback
                      chainInfo={currentBitcoinChainInfo}
                      size="1.25rem"
                      style={{
                        opacity: isHoveredCurrenctChainIconForBitcoin ? 0.8 : 1,
                      }}
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
                </ChainSelector>
              )}
            {currentChainIdForStarknet != null && activeTabOrigin != null && (
              <ChainSelector
                isOpen={isOpenCurrentChainSelectorForStarknet}
                close={() => setIsOpenCurrentChainSelectorForStarknet(false)}
                items={starknetChainInfos.map((chainInfo) => ({
                  key: chainInfo.chainId,
                  content: (
                    <Columns sum={1} alignY="center" gutter="0.5rem">
                      <ChainImageFallback chainInfo={chainInfo} size="2rem" />
                      <Subtitle3>{chainInfo.chainName}</Subtitle3>
                    </Columns>
                  ),
                  onSelect: async (key) => {
                    const msg = new UpdateCurrentChainIdForStarknetMsg(
                      activeTabOrigin,
                      key
                    );
                    await new InExtensionMessageRequester().sendMessage(
                      BACKGROUND_PORT,
                      msg
                    );
                    setCurrentChainIdForStarknet(key);
                  },
                }))}
                selectedItemKey={currentChainIdForStarknet}
                activeTabOrigin={activeTabOrigin}
                footerContent={
                  <Body2>Select a Starknet-compatible chain to connect.</Body2>
                }
              >
                <Box
                  borderRadius="99999px"
                  position="relative"
                  cursor="pointer"
                  onHoverStateChange={setIsHoveredCurrenctChainIconForStarknet}
                  onClick={() => setIsOpenCurrentChainSelectorForStarknet(true)}
                >
                  <ChainImageFallback
                    chainInfo={chainStore.getModularChain(
                      currentChainIdForStarknet
                    )}
                    size="1.25rem"
                    style={{
                      opacity: isHoveredCurrenctChainIconForStarknet ? 0.8 : 1,
                    }}
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
              </ChainSelector>
            )}
            {currentChainIdForEVM != null && activeTabOrigin != null && (
              <ChainSelector
                isOpen={isOpenCurrentChainSelectorForEVM}
                close={() => setIsOpenCurrentChainSelectorForEVM(false)}
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
                footerContent={
                  <Body2>Select an EVM-compatible chain to connect.</Body2>
                }
              >
                <Box
                  borderRadius="99999px"
                  position="relative"
                  cursor="pointer"
                  onHoverStateChange={setIsHoveredCurrenctChainIconForEVM}
                  onClick={() => setIsOpenCurrentChainSelectorForEVM(true)}
                >
                  <ChainImageFallback
                    chainInfo={chainStore.getChain(currentChainIdForEVM)}
                    size="1.25rem"
                    style={{
                      opacity: isHoveredCurrenctChainIconForEVM ? 0.8 : 1,
                    }}
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
              </ChainSelector>
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

const ChainSelector: FunctionComponent<
  PropsWithChildren<{
    isOpen: boolean;
    close: () => void;
    items: {
      key: string;
      content: React.ReactNode;
      onSelect: (key: string) => void;
      isDisabled?: boolean;
    }[];
    selectedItemKey: string;
    activeTabOrigin: string;
    headerContent?: React.ReactNode;
    headerBoxPropsOverride?: BoxProps;
    footerContent?: React.ReactNode;
    footerBoxPropsOverride?: BoxProps;
  }>
> = observer(
  ({
    children,
    isOpen,
    close,
    items,
    selectedItemKey,
    activeTabOrigin,
    headerContent,
    headerBoxPropsOverride,
    footerContent,
    footerBoxPropsOverride,
  }) => {
    const theme = useTheme();
    const { x, y, strategy, refs } = useFloating({
      placement: "bottom-end",
      middleware: [
        shift(),
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
              backgroundColor:
                theme.mode === "light"
                  ? ColorPalette["white"]
                  : ColorPalette["gray-600"],
              borderRadius: "0.375rem",
              borderStyle: "solid",
              borderWidth: "1px",
              borderColor:
                theme.mode === "light"
                  ? ColorPalette["gray-100"]
                  : ColorPalette["gray-500"],
            }}
          >
            <Box
              alignX="left"
              alignY="center"
              paddingX="1rem"
              paddingY="1.25rem"
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-400"]
                  : ColorPalette["gray-200"]
              }
              backgroundColor={
                theme.mode === "light"
                  ? ColorPalette["white"]
                  : ColorPalette["gray-600"]
              }
              style={{
                borderTopLeftRadius: "0.375rem",
                borderTopRightRadius: "0.375rem",
                borderBottomStyle: "solid",
                borderBottomWidth: "1px",
                borderBottomColor:
                  theme.mode === "light"
                    ? ColorPalette["gray-100"]
                    : ColorPalette["gray-500"],
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
            {headerContent && (
              <Box
                alignX="left"
                alignY="center"
                paddingX="1rem"
                paddingY="1.25rem"
                style={{
                  borderTopLeftRadius: "0.375rem",
                  borderTopRightRadius: "0.375rem",
                  borderBottomStyle: "solid",
                  borderBottomWidth: "1px",
                  borderBottomColor:
                    theme.mode === "light"
                      ? ColorPalette["gray-100"]
                      : ColorPalette["gray-500"],
                }}
                {...headerBoxPropsOverride}
              >
                {headerContent}
              </Box>
            )}
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
                    cursor={item.isDisabled ? undefined : "pointer"}
                    color={
                      item.isDisabled
                        ? ColorPalette["gray-300"]
                        : theme.mode === "light"
                        ? ColorPalette["gray-700"]
                        : ColorPalette["white"]
                    }
                    backgroundColor={
                      ColorPalette[
                        isSelectedItem
                          ? theme.mode === "light"
                            ? "gray-100"
                            : "gray-650"
                          : theme.mode === "light"
                          ? "white"
                          : "gray-600"
                      ]
                    }
                    hover={{
                      backgroundColor: item.isDisabled
                        ? "transparent"
                        : theme.mode === "light"
                        ? ColorPalette["gray-50"]
                        : ColorPalette["gray-550"],
                    }}
                    onClick={(e) => {
                      e.preventDefault();

                      if (item.isDisabled) {
                        return;
                      }

                      item.onSelect(item.key);

                      close();
                    }}
                  >
                    {item.content}
                    {isSelectedItem && (
                      <CheckIcon
                        color={
                          theme.mode === "light"
                            ? ColorPalette["blue-400"]
                            : ColorPalette["gray-200"]
                        }
                      />
                    )}
                  </Box>
                );
              })}
            </SimpleBar>
            <Box
              alignX="left"
              alignY="center"
              paddingX="1rem"
              paddingY="1.25rem"
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-300"]
                  : ColorPalette["gray-200"]
              }
              style={{
                borderBottomLeftRadius: "0.375rem",
                borderBottomRightRadius: "0.375rem",
              }}
              {...footerBoxPropsOverride}
            >
              {footerContent}
            </Box>
          </div>
        )}
      </React.Fragment>
    );
  }
);
