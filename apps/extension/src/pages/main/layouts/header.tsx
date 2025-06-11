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
  BaseTypography,
  Body2,
  Body3,
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
import {
  SupportedPaymentType as BitcoinPaymentType,
  ChainInfo,
  ModularChainInfo,
} from "@keplr-wallet/types";
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

const ConnectedEcosystems: FunctionComponent = observer(() => {
  const { chainStore } = useStore();

  const [currentChainIdForEVM, setCurrentChainIdForEVM] = React.useState<
    string | undefined
  >();
  const [currentChainIdForStarknet, setCurrentChainIdForStarknet] =
    React.useState<string | undefined>();

  const [currentChainIdForBitcoin, setCurrentChainIdForBitcoin] =
    React.useState<string | undefined>();

  const [preferredPaymentTypeForBitcoin, setPreferredPaymentTypeForBitcoin] =
    React.useState<BitcoinPaymentType | undefined>();

  const [activeTabOrigin, setActiveTabOrigin] = React.useState<
    string | undefined
  >();

  const evmChainInfos = chainStore.chainInfos.filter((chainInfo) =>
    chainStore.isEvmChain(chainInfo.chainId)
  );

  const starknetChainInfos = chainStore.modularChainInfos.filter(
    (modularChainInfo) => "starknet" in modularChainInfo
  );

  const bitcoinChainInfos = chainStore.groupedModularChainInfos.filter(
    (modularChainInfo) => "bitcoin" in modularChainInfo
  );

  const [isOpenEcosystemSelector, setIsOpenEcosystemSelector] =
    React.useState(false);
  const [isHoveredEcosystemSelector, setIsHoveredEcosystemSelector] =
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

  const ecosystemSections: Array<EcosystemSection> = [];

  if (currentChainIdForBitcoin) {
    ecosystemSections.push({
      type: "bitcoin",
      chainId: currentChainIdForBitcoin,
      chainInfos: bitcoinChainInfos,
      currentChainId: currentChainIdForBitcoin,
      setCurrentChainId: setCurrentChainIdForBitcoin,
      preferredPaymentType: preferredPaymentTypeForBitcoin,
      setPreferredPaymentType: setPreferredPaymentTypeForBitcoin,
    });
  }

  if (currentChainIdForStarknet) {
    ecosystemSections.push({
      type: "starknet",
      chainId: currentChainIdForStarknet,
      chainInfos: starknetChainInfos,
      currentChainId: currentChainIdForStarknet,
      setCurrentChainId: setCurrentChainIdForStarknet,
    });
  }

  if (currentChainIdForEVM) {
    ecosystemSections.push({
      type: "evm",
      chainId: currentChainIdForEVM,
      chainInfos: evmChainInfos,
      currentChainId: currentChainIdForEVM,
      setCurrentChainId: setCurrentChainIdForEVM,
    });
  }

  const hasConnectedEcosystems = ecosystemSections.length > 0;

  if (hasConnectedEcosystems && activeTabOrigin) {
    return (
      <MultipleEcosystemsSelector
        ecosystemSections={ecosystemSections}
        isOpen={isOpenEcosystemSelector}
        onOpenChange={setIsOpenEcosystemSelector}
        isHovered={isHoveredEcosystemSelector}
        onHoverChange={setIsHoveredEcosystemSelector}
        activeTabOrigin={activeTabOrigin}
      />
    );
  }

  return null;
});

type EcosystemType = "bitcoin" | "starknet" | "evm";

type EcosystemSection = {
  type: EcosystemType;
  chainId: string;
  chainInfos: (ModularChainInfo | ChainInfo)[];
  currentChainId: string;
  setCurrentChainId: (chainId: string) => void;
  preferredPaymentType?: BitcoinPaymentType;
  setPreferredPaymentType?: (type: BitcoinPaymentType) => void;
};

const EcosystemOverviewSelector: FunctionComponent<{
  ecosystemSections: EcosystemSection[];
  setSelectionState: (state: any) => void;
  theme: any;
}> = ({ ecosystemSections, setSelectionState, theme }) => {
  const { chainStore, accountStore } = useStore();

  return (
    <React.Fragment>
      {ecosystemSections.map((section) => {
        let chainInfo;

        if (section.type === "bitcoin") {
          chainInfo = chainStore.groupedModularChainInfos.find(
            (chain) =>
              "bitcoin" in chain && chain.bitcoin.chainId === section.chainId
          );
        } else if (section.type === "starknet") {
          chainInfo = chainStore.getModularChain(section.chainId);
        } else if (section.type === "evm") {
          chainInfo = chainStore.getChain(section.chainId);
        }

        if (!chainInfo) return null;

        if (section.type === "bitcoin") {
          const currentAddressType =
            section.preferredPaymentType === "native-segwit"
              ? "Native SegWit"
              : "Taproot";

          const address = accountStore.getAccount(
            `${section.currentChainId}:${section.preferredPaymentType}`
          )?.bitcoinAddress?.bech32Address;

          return (
            <React.Fragment key={section.chainId}>
              <Box
                paddingX="1rem"
                paddingY="0.75rem"
                cursor="pointer"
                backgroundColor={
                  theme.mode === "light"
                    ? ColorPalette["white"]
                    : ColorPalette["gray-600"]
                }
                hover={{
                  backgroundColor:
                    theme.mode === "light"
                      ? ColorPalette["gray-50"]
                      : ColorPalette["gray-550"],
                }}
                onClick={() => {
                  setSelectionState({
                    ecosystemType: "bitcoin",
                    selectionMode: "chain",
                  });
                }}
              >
                <Columns sum={1} alignY="center" gutter="0.5rem">
                  <ChainImageFallback chainInfo={chainInfo} size="1.5rem" />
                  <YAxis>
                    <Subtitle3
                      color={
                        theme.mode === "light"
                          ? ColorPalette["gray-700"]
                          : ColorPalette["white"]
                      }
                    >
                      Bitcoin
                    </Subtitle3>
                    <Gutter size="0.125rem" />
                    <Body3 color={ColorPalette["gray-300"]}>
                      {chainInfo.chainName}
                    </Body3>
                  </YAxis>
                  <div style={{ flex: 1 }} />
                  <RightArrowIcon
                    color={
                      theme.mode === "light"
                        ? ColorPalette["gray-300"]
                        : ColorPalette["gray-200"]
                    }
                    width="1rem"
                    height="1rem"
                  />
                </Columns>
              </Box>

              <Box
                paddingX="1rem"
                paddingY="0.75rem"
                cursor="pointer"
                backgroundColor={
                  theme.mode === "light"
                    ? ColorPalette["white"]
                    : ColorPalette["gray-600"]
                }
                hover={{
                  backgroundColor:
                    theme.mode === "light"
                      ? ColorPalette["gray-50"]
                      : ColorPalette["gray-550"],
                }}
                onClick={() => {
                  setSelectionState({
                    ecosystemType: "bitcoin",
                    selectionMode: "address-type",
                  });
                }}
              >
                <Columns sum={1} alignY="center" gutter="0.5rem">
                  <YAxis>
                    <Subtitle3
                      color={
                        theme.mode === "light"
                          ? ColorPalette["gray-700"]
                          : ColorPalette["white"]
                      }
                    >
                      Address Type
                    </Subtitle3>
                    <Gutter size="0.125rem" />
                    <Columns sum={1} alignY="center" gutter="0.5rem">
                      <Subtitle3
                        color={
                          theme.mode === "light"
                            ? ColorPalette["gray-700"]
                            : ColorPalette["white"]
                        }
                      >
                        {currentAddressType}
                      </Subtitle3>
                      {address && (
                        <React.Fragment>
                          <Gutter size="0.125rem" />
                          <Body3 color={ColorPalette["gray-300"]}>
                            {Bech32Address.shortenAddress(address, 15)}
                          </Body3>
                        </React.Fragment>
                      )}
                    </Columns>
                  </YAxis>
                  <div style={{ flex: 1 }} />
                  <RightArrowIcon
                    color={
                      theme.mode === "light"
                        ? ColorPalette["gray-300"]
                        : ColorPalette["gray-200"]
                    }
                    width="1rem"
                    height="1rem"
                  />
                </Columns>
              </Box>
            </React.Fragment>
          );
        }

        return (
          <Box
            key={section.chainId}
            paddingX="1rem"
            paddingY="0.75rem"
            cursor="pointer"
            backgroundColor={
              theme.mode === "light"
                ? ColorPalette["white"]
                : ColorPalette["gray-600"]
            }
            hover={{
              backgroundColor:
                theme.mode === "light"
                  ? ColorPalette["gray-50"]
                  : ColorPalette["gray-550"],
            }}
            onClick={() => {
              setSelectionState({
                ecosystemType: section.type,
              });
            }}
          >
            <Columns sum={1} alignY="center" gutter="0.5rem">
              <ChainImageFallback chainInfo={chainInfo} size="1.5rem" />
              <YAxis>
                <Subtitle3
                  color={
                    theme.mode === "light"
                      ? ColorPalette["gray-700"]
                      : ColorPalette["white"]
                  }
                >
                  {section.type === "starknet" ? "Starknet" : "EVM"}
                </Subtitle3>
                <Gutter size="0.125rem" />
                <Body3 color={ColorPalette["gray-300"]}>
                  {chainInfo.chainName}
                </Body3>
              </YAxis>
              <div style={{ flex: 1 }} />
              <RightArrowIcon
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-300"]
                    : ColorPalette["gray-200"]
                }
                width="1rem"
                height="1rem"
              />
            </Columns>
          </Box>
        );
      })}
    </React.Fragment>
  );
};

const MultipleEcosystemsSelector: FunctionComponent<{
  ecosystemSections: Array<EcosystemSection>;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  isHovered: boolean;
  onHoverChange: (isHovered: boolean) => void;
  activeTabOrigin: string;
}> = ({
  ecosystemSections,
  isOpen,
  onOpenChange,
  isHovered,
  onHoverChange,
  activeTabOrigin,
}) => {
  const theme = useTheme();
  const { chainStore } = useStore();

  const [selectionState, setSelectionState] = React.useState<{
    ecosystemType: EcosystemType;
    selectionMode?: "chain" | "address-type";
  } | null>(null);

  const bitcoinSection = React.useMemo(
    () => ecosystemSections.find((section) => section.type === "bitcoin"),
    [ecosystemSections]
  );

  const starknetSection = React.useMemo(
    () => ecosystemSections.find((section) => section.type === "starknet"),
    [ecosystemSections]
  );

  const evmSection = React.useMemo(
    () => ecosystemSections.find((section) => section.type === "evm"),
    [ecosystemSections]
  );

  const representativeSection = ecosystemSections[0];
  let representativeChainInfo;

  if (representativeSection?.type === "bitcoin") {
    representativeChainInfo = chainStore.groupedModularChainInfos.find(
      (chain) =>
        "bitcoin" in chain &&
        chain.bitcoin.chainId === representativeSection.chainId
    );
  } else if (representativeSection?.type === "starknet") {
    representativeChainInfo = chainStore.getModularChain(
      representativeSection.chainId
    );
  } else if (representativeSection?.type === "evm") {
    representativeChainInfo = chainStore.getChain(
      representativeSection.chainId
    );
  }

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

  const closeRef = useRef(() => onOpenChange(false));
  closeRef.current = () => onOpenChange(false);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const floatingRef = refs.floating;
      const triggerRef = refs.reference;

      if (
        floatingRef.current &&
        "contains" in floatingRef.current &&
        !floatingRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        "contains" in triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        closeRef.current();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [refs.floating, refs.reference]);

  useEffect(() => {
    if (!isOpen) {
      setSelectionState(null);
    }
  }, [isOpen]);

  const renderContent = React.useMemo(() => {
    if (
      selectionState?.ecosystemType === "bitcoin" &&
      bitcoinSection &&
      selectionState.selectionMode === "address-type"
    ) {
      return <BitcoinAddressTypeSelector bitcoinSection={bitcoinSection} />;
    }

    if (
      selectionState?.ecosystemType === "bitcoin" &&
      bitcoinSection &&
      (selectionState.selectionMode === "chain" ||
        selectionState.selectionMode === undefined)
    ) {
      return (
        <ChainSelector
          chainInfos={bitcoinSection.chainInfos}
          currentChainId={bitcoinSection.currentChainId}
          setCurrentChainId={bitcoinSection.setCurrentChainId}
          activeTabOrigin={activeTabOrigin}
          updateMessage={UpdateCurrentChainIdForBitcoinMsg}
          // baseChainId is used for bitcoin chains
          getChainId={(chainInfo: ModularChainInfo | ChainInfo) =>
            "bitcoin" in chainInfo
              ? chainInfo.bitcoin.chainId
              : chainInfo.chainId
          }
          isChainSelected={(
            chainInfo: ModularChainInfo | ChainInfo,
            currentChainId: string
          ) => {
            const chainId =
              "bitcoin" in chainInfo
                ? chainInfo.bitcoin.chainId
                : chainInfo.chainId;
            return currentChainId === chainId;
          }}
        />
      );
    }

    if (selectionState?.ecosystemType === "starknet" && starknetSection) {
      return (
        <ChainSelector
          chainInfos={starknetSection.chainInfos}
          currentChainId={starknetSection.currentChainId}
          setCurrentChainId={starknetSection.setCurrentChainId}
          activeTabOrigin={activeTabOrigin}
          updateMessage={UpdateCurrentChainIdForStarknetMsg}
        />
      );
    }

    if (selectionState?.ecosystemType === "evm" && evmSection) {
      return (
        <ChainSelector
          chainInfos={evmSection.chainInfos}
          currentChainId={evmSection.currentChainId}
          setCurrentChainId={evmSection.setCurrentChainId}
          activeTabOrigin={activeTabOrigin}
          updateMessage={UpdateCurrentChainIdForEVMMsg}
        />
      );
    }

    return (
      <EcosystemOverviewSelector
        ecosystemSections={ecosystemSections}
        setSelectionState={setSelectionState}
        theme={theme}
      />
    );
  }, [
    selectionState,
    bitcoinSection,
    starknetSection,
    evmSection,
    ecosystemSections,
    activeTabOrigin,
    theme,
  ]);

  const footerText = React.useMemo(() => {
    if (selectionState?.ecosystemType === "bitcoin") {
      if (selectionState.selectionMode === "chain") {
        return "Select a Bitcoin network to connect.";
      } else if (selectionState.selectionMode === "address-type") {
        return "Select the address type you'd like to use with the web application.";
      }
    } else if (selectionState?.ecosystemType === "starknet") {
      return "Select a Starknet-compatible chain to connect.";
    } else if (selectionState?.ecosystemType === "evm") {
      return "Select an EVM-compatible chain to connect.";
    }
    return null;
  }, [selectionState]);

  const shouldShowBackButton = selectionState !== null;

  return (
    <React.Fragment>
      <div ref={refs.setReference}>
        <Box
          borderRadius="99999px"
          position="relative"
          cursor="pointer"
          onHoverStateChange={onHoverChange}
          onClick={() => onOpenChange(!isOpen)}
        >
          {representativeChainInfo && (
            <ChainImageFallback
              chainInfo={representativeChainInfo}
              size="1.25rem"
              style={{
                opacity: isHovered ? 0.8 : 1,
              }}
            />
          )}

          <Box
            backgroundColor={ColorPalette["gray-700"]}
            width="0.875rem"
            height="0.875rem"
            borderRadius="99999px"
            position="absolute"
            style={{ right: "-0.234rem", bottom: "-0.29rem" }}
            alignX="center"
            alignY="center"
          >
            <BaseTypography
              color={ColorPalette["gray-200"]}
              style={{
                fontSize: "0.625rem",
                fontWeight: 600,
                lineHeight: "normal",
              }}
            >
              {ecosystemSections.length}
            </BaseTypography>
          </Box>
        </Box>
      </div>

      {isOpen && (
        <div
          ref={refs.setFloating}
          style={{
            position: strategy,
            top: y ?? 0,
            left: x ?? 0,
            width: "19rem",
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
            overflow: "hidden",
          }}
        >
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
          >
            <Columns sum={1} alignY="center" gutter="0.5rem">
              <Box
                backgroundColor={ColorPalette["green-400"]}
                width="0.375rem"
                height="0.375rem"
                borderRadius="99999px"
              />
              <Body2
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-400"]
                    : ColorPalette["gray-200"]
                }
              >
                {activeTabOrigin}
              </Body2>
            </Columns>
          </Box>

          {shouldShowBackButton && (
            <Box
              alignX="left"
              alignY="center"
              paddingX="1rem"
              paddingY="1.25rem"
              style={{
                borderBottomStyle: "solid",
                borderBottomWidth: "1px",
                borderBottomColor:
                  theme.mode === "light"
                    ? ColorPalette["gray-100"]
                    : ColorPalette["gray-500"],
              }}
            >
              <Box
                alignY="center"
                alignX="left"
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "0.375rem",
                  cursor: "pointer",
                }}
                onClick={() => {
                  setSelectionState(null);
                }}
              >
                <ArrowLeftIcon
                  width="1rem"
                  height="1rem"
                  color={ColorPalette["gray-200"]}
                />
                <Body2 color={ColorPalette["gray-300"]}>Back</Body2>
              </Box>
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
            {renderContent}
          </SimpleBar>

          {footerText && (
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
            >
              <Body2>{footerText}</Body2>
            </Box>
          )}
        </div>
      )}
    </React.Fragment>
  );
};

const ChainSelector: FunctionComponent<{
  chainInfos: (ModularChainInfo | ChainInfo)[];
  currentChainId: string;
  setCurrentChainId: (chainId: string) => void;
  activeTabOrigin: string;
  updateMessage:
    | typeof UpdateCurrentChainIdForBitcoinMsg
    | typeof UpdateCurrentChainIdForStarknetMsg
    | typeof UpdateCurrentChainIdForEVMMsg;
  getChainId?: (chainInfo: ModularChainInfo | ChainInfo) => string;
  isChainSelected?: (
    chainInfo: ModularChainInfo | ChainInfo,
    currentChainId: string
  ) => boolean;
}> = ({
  chainInfos,
  currentChainId,
  setCurrentChainId,
  activeTabOrigin,
  updateMessage,
  getChainId,
  isChainSelected,
}) => {
  const theme = useTheme();
  return (
    <React.Fragment>
      {chainInfos.map((chainInfo) => {
        const chainId = getChainId ? getChainId(chainInfo) : chainInfo.chainId;
        const isSelected = isChainSelected
          ? isChainSelected(chainInfo, currentChainId)
          : currentChainId === chainInfo.chainId;

        return (
          <Box
            key={chainId}
            paddingX="1rem"
            paddingY="0.75rem"
            cursor="pointer"
            backgroundColor={
              isSelected
                ? theme.mode === "light"
                  ? ColorPalette["gray-100"]
                  : ColorPalette["gray-650"]
                : theme.mode === "light"
                ? ColorPalette["white"]
                : ColorPalette["gray-600"]
            }
            hover={{
              backgroundColor:
                theme.mode === "light"
                  ? ColorPalette["gray-50"]
                  : ColorPalette["gray-550"],
            }}
            onClick={async () => {
              const msg = new updateMessage(activeTabOrigin, chainId);
              await new InExtensionMessageRequester().sendMessage(
                BACKGROUND_PORT,
                msg
              );
              setCurrentChainId(chainId);
            }}
          >
            <Columns sum={1} alignY="center" gutter="0.5rem">
              <ChainImageFallback chainInfo={chainInfo} size="2rem" />
              <Subtitle3
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-700"]
                    : ColorPalette["white"]
                }
              >
                {chainInfo.chainName}
              </Subtitle3>
              <div style={{ flex: 1 }} />
              {isSelected && (
                <CheckIcon
                  color={
                    theme.mode === "light"
                      ? ColorPalette["blue-400"]
                      : ColorPalette["gray-200"]
                  }
                />
              )}
            </Columns>
          </Box>
        );
      })}
    </React.Fragment>
  );
};

interface OptionItem<T = string> {
  key: T;
  label: string;
  secondaryText?: string;
}

const OptionSelector: FunctionComponent<{
  options: OptionItem[];
  selectedValue: string;
  onSelect: (value: string) => Promise<void>;
  getSecondaryText?: (key: string) => string | undefined;
}> = ({ options, selectedValue, onSelect, getSecondaryText }) => {
  const theme = useTheme();

  return (
    <React.Fragment>
      {options.map((option) => {
        const isSelected = selectedValue === option.key;
        const secondaryText = getSecondaryText
          ? getSecondaryText(option.key)
          : option.secondaryText;

        return (
          <Box
            key={option.key}
            paddingX="1rem"
            paddingY="0.75rem"
            cursor="pointer"
            backgroundColor={
              isSelected
                ? theme.mode === "light"
                  ? ColorPalette["gray-100"]
                  : ColorPalette["gray-650"]
                : theme.mode === "light"
                ? ColorPalette["white"]
                : ColorPalette["gray-600"]
            }
            hover={{
              backgroundColor:
                theme.mode === "light"
                  ? ColorPalette["gray-50"]
                  : ColorPalette["gray-550"],
            }}
            onClick={() => onSelect(option.key)}
          >
            <Columns sum={1} alignY="center" gutter="0.5rem">
              <YAxis>
                <Subtitle3
                  color={
                    theme.mode === "light"
                      ? ColorPalette["gray-700"]
                      : ColorPalette["white"]
                  }
                >
                  {option.label}
                </Subtitle3>
                {secondaryText && (
                  <React.Fragment>
                    <Gutter size="0.25rem" />
                    <Body3 color={ColorPalette["gray-300"]}>
                      {secondaryText}
                    </Body3>
                  </React.Fragment>
                )}
              </YAxis>
              <div style={{ flex: 1 }} />
              {isSelected && (
                <CheckIcon
                  color={
                    theme.mode === "light"
                      ? ColorPalette["blue-400"]
                      : ColorPalette["gray-200"]
                  }
                />
              )}
            </Columns>
          </Box>
        );
      })}
    </React.Fragment>
  );
};

const BitcoinAddressTypeSelector: FunctionComponent<{
  bitcoinSection: EcosystemSection;
}> = ({ bitcoinSection }) => {
  const { accountStore } = useStore();

  const bitcoinAddressOptions: OptionItem[] = [
    { key: "taproot", label: "Taproot" },
    { key: "native-segwit", label: "Native SegWit" },
  ];

  const getAddressText = (key: string) => {
    const address = accountStore.getAccount(
      `${bitcoinSection.currentChainId}:${key}`
    )?.bitcoinAddress?.bech32Address;
    return address ? Bech32Address.shortenAddress(address, 20) : undefined;
  };

  const handleSelect = async (key: string) => {
    if (key !== "taproot" && key !== "native-segwit") {
      return;
    }
    const msg = new SetPreferredBitcoinPaymentTypeMsg(
      key as BitcoinPaymentType
    );
    await new InExtensionMessageRequester().sendMessage(BACKGROUND_PORT, msg);
    bitcoinSection.setPreferredPaymentType?.(key as BitcoinPaymentType);
  };

  return (
    <OptionSelector
      options={bitcoinAddressOptions}
      selectedValue={bitcoinSection.preferredPaymentType ?? "taproot"}
      onSelect={handleSelect}
      getSecondaryText={getAddressText}
    />
  );
};
