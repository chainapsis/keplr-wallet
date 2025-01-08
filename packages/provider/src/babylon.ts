import {
  IBBNProvider,
  Keplr,
  OfflineAminoSigner,
  OfflineDirectSigner,
} from "@keplr-wallet/types";

const BabylonChainInfo = {
  chainId: "bbn-test-5",
  chainName: "Babylon Phase-2 Testnet",
  chainSymbolImageUrl:
    "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/bbn-test/chain.png",
  rpc: "https://babylon-testnet-rpc.nodes.guru",
  rest: "https://babylon-testnet-api.nodes.guru",
  nodeProvider: {
    name: "NodesGuru",
    email: "security@nodes.guru",
    website: "https://nodes.guru/",
  },
  bip44: {
    coinType: 118,
  },
  bech32Config: {
    bech32PrefixAccAddr: "bbn",
    bech32PrefixAccPub: "bbnpub",
    bech32PrefixValAddr: "bbnvaloper",
    bech32PrefixValPub: "bbnvaloperpub",
    bech32PrefixConsAddr: "bbnvalcons",
    bech32PrefixConsPub: "bbnvalconspub",
  },
  currencies: [
    {
      coinDenom: "BABY",
      coinMinimalDenom: "ubbn",
      coinDecimals: 6,
      coinImageUrl:
        "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/bbn-test/chain.png",
    },
  ],
  feeCurrencies: [
    {
      coinDenom: "BABY",
      coinMinimalDenom: "ubbn",
      coinDecimals: 6,
      coinImageUrl:
        "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/bbn-test/chain.png",
      gasPriceStep: {
        low: 0.007,
        average: 0.007,
        high: 0.01,
      },
    },
  ],
  stakeCurrency: {
    coinDenom: "BABY",
    coinMinimalDenom: "ubbn",
    coinDecimals: 6,
    coinImageUrl:
      "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/bbn-test/chain.png",
  },
  features: ["cosmwasm"],
};

export class KeplrBBNProvider implements IBBNProvider {
  constructor(protected readonly keplr: Keplr) {}

  async connectWallet(): Promise<void> {
    await this.keplr.experimentalSuggestChain(BabylonChainInfo);
    await this.keplr.enable(BabylonChainInfo.chainId);
  }

  async getAddress(): Promise<string> {
    await this.keplr.experimentalSuggestChain(BabylonChainInfo);
    await this.keplr.enable(BabylonChainInfo.chainId);
    return (await this.keplr.getKey(BabylonChainInfo.chainId)).bech32Address;
  }

  async getOfflineSigner(): Promise<OfflineAminoSigner & OfflineDirectSigner> {
    return this.keplr.getOfflineSigner(BabylonChainInfo.chainId);
  }

  async getPublicKeyHex(): Promise<string> {
    await this.keplr.experimentalSuggestChain(BabylonChainInfo);
    await this.keplr.enable(BabylonChainInfo.chainId);
    return Array.from(
      (await this.keplr.getKey(BabylonChainInfo.chainId)).pubKey
    )
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  async getWalletProviderIcon(): Promise<string> {
    return process.env["KEPLR_EXT_EIP6963_PROVIDER_INFO_ICON"] || "";
  }

  async getWalletProviderName(): Promise<string> {
    return "Keplr";
  }
}
