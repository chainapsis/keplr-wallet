import { ModularChainInfo } from "@keplr-wallet/types";

export type EcosystemType = "bitcoin" | "evm" | "starknet";

export const EcosystemTypeToText: Record<EcosystemType, string> = {
  bitcoin: "Bitcoin",
  evm: "EVM",
  starknet: "Starknet",
};

export type EcosystemSection = {
  type: EcosystemType;
  chainId: string;
  chainInfos: ModularChainInfo[];
  currentChainId: string;
  setCurrentChainId: (chainId: string) => void;
  footer?: {
    visible: boolean;
    text?: string;
  };
  specificOptions?: EcosystemSpecificOption[];
};

// Ecosystem-specific options (e.g. Bitcoin address type)
export interface EcosystemSpecificOption<T = any> {
  key: string;
  label: string;
  currentValue: T;
  options: OptionItem<T>[];
  onSelect: (value: T) => Promise<void>;
  getSecondaryText?: (value: T) => string | undefined;
  footerText?: string;
}

export interface EcosystemOptionConfig {
  displayName: (value: any) => string;
  secondaryDisplay?: (option: EcosystemSpecificOption) => string | undefined;
  selectionMode: string;
  label: string;
}

export interface OptionItem<T = string> {
  key: T;
  label: string;
  secondaryText?: string;
}
