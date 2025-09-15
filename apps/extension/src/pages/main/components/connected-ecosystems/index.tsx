import React, { FunctionComponent, useEffect } from "react";
import { SupportedPaymentType as BitcoinPaymentType } from "@keplr-wallet/types";
import { useStore } from "../../../../stores";
import { getActiveTabOrigin } from "../../../../utils/browser-api";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { BACKGROUND_PORT } from "@keplr-wallet/router";
import {
  GetCurrentChainIdForEVMMsg,
  GetCurrentChainIdForStarknetMsg,
  GetCurrentChainIdForBitcoinMsg,
  GetPreferredBitcoinPaymentTypeMsg,
} from "@keplr-wallet/background";
import { observer } from "mobx-react-lite";
import { EcosystemSection } from "./types";
import { createBitcoinSpecificOptions } from "./utils";
import { EcosystemsSelector } from "./ecosystem-selector";

export const ConnectedEcosystems: FunctionComponent = observer(() => {
  const { chainStore, accountStore } = useStore();

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
    chainStore.isEvmSupport(chainInfo.chainId)
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
      specificOptions: createBitcoinSpecificOptions(
        currentChainIdForBitcoin,
        preferredPaymentTypeForBitcoin,
        setPreferredPaymentTypeForBitcoin,
        accountStore
      ),
      footer: {
        visible: true,
      },
    });
  }

  if (currentChainIdForEVM) {
    ecosystemSections.push({
      type: "evm",
      chainId: currentChainIdForEVM,
      chainInfos: evmChainInfos,
      currentChainId: currentChainIdForEVM,
      setCurrentChainId: setCurrentChainIdForEVM,
      specificOptions: undefined,
      footer: {
        visible: true,
        text: "Select an EVM-compatible chain to connect.",
      },
    });
  }

  if (currentChainIdForStarknet) {
    ecosystemSections.push({
      type: "starknet",
      chainId: currentChainIdForStarknet,
      chainInfos: starknetChainInfos,
      currentChainId: currentChainIdForStarknet,
      setCurrentChainId: setCurrentChainIdForStarknet,
      specificOptions: undefined,
      footer: {
        visible: true,
        text: "Select a Starknet-compatible chain to connect.",
      },
    });
  }

  const hasConnectedEcosystems = ecosystemSections.length > 0;

  if (hasConnectedEcosystems && activeTabOrigin) {
    return (
      <EcosystemsSelector
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
