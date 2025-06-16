import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { BACKGROUND_PORT } from "@keplr-wallet/router";
import { SetPreferredBitcoinPaymentTypeMsg } from "@keplr-wallet/background";
import { SupportedPaymentType as BitcoinPaymentType } from "@keplr-wallet/types";
import { Bech32Address } from "@keplr-wallet/cosmos";
import {
  EcosystemType,
  EcosystemSpecificOption,
  EcosystemOptionConfig,
  EcosystemSection,
} from "./types";

export const ecosystemOptionConfigs: Record<
  EcosystemType,
  Record<string, EcosystemOptionConfig>
> = {
  bitcoin: {
    "address-type": {
      displayName: (value: string) =>
        value === "native-segwit" ? "Native SegWit" : "Taproot",
      secondaryDisplay: (option: EcosystemSpecificOption) =>
        option.getSecondaryText?.(option.currentValue),
      selectionMode: "address-type",
      label: "Address Type",
    },
  },
  evm: {},
  starknet: {},
};

export const createBitcoinSpecificOptions = (
  currentChainId: string,
  preferredPaymentType: BitcoinPaymentType | undefined,
  setPreferredPaymentType: ((type: BitcoinPaymentType) => void) | undefined,
  accountStore: any
): EcosystemSpecificOption[] => {
  return [
    {
      key: "address-type",
      label: "Address Type",
      currentValue: preferredPaymentType ?? "taproot",
      options: [
        { key: "taproot", label: "Taproot" },
        { key: "native-segwit", label: "Native SegWit" },
      ],
      onSelect: async (value: string) => {
        if (value !== "taproot" && value !== "native-segwit") {
          return;
        }
        const msg = new SetPreferredBitcoinPaymentTypeMsg(
          value as BitcoinPaymentType
        );
        await new InExtensionMessageRequester().sendMessage(
          BACKGROUND_PORT,
          msg
        );
        setPreferredPaymentType?.(value as BitcoinPaymentType);
      },
      getSecondaryText: (value: string) => {
        const address = accountStore.getAccount(`${currentChainId}:${value}`)
          ?.bitcoinAddress?.bech32Address;
        return address ? Bech32Address.shortenAddress(address, 20) : undefined;
      },
      footerText:
        "Select the address type you'd like to use with the web application.",
    },
  ];
};

export const parseEcosystemSpecificOptions = (section: EcosystemSection) => {
  const configs = ecosystemOptionConfigs[section.type] || {};
  const parsedOptions: Record<
    string,
    {
      displayName: string;
      secondaryText?: string;
      option: EcosystemSpecificOption;
      config: EcosystemOptionConfig;
    }
  > = {};

  section.specificOptions?.forEach((option) => {
    const config = configs[option.key];
    if (config) {
      parsedOptions[option.key] = {
        displayName: config.displayName(option.currentValue),
        secondaryText: config.secondaryDisplay?.(option),
        option,
        config,
      };
    }
  });

  return parsedOptions;
};
