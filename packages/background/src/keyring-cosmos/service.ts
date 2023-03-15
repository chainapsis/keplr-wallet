import { ChainsService } from "../chains";
import { KeyRingService } from "../keyring-v2";
import { ChainInfo, Key } from "@keplr-wallet/types";
import { Env } from "@keplr-wallet/router";
import { Bech32Address } from "@keplr-wallet/cosmos";

export class KeyRingCosmosService {
  constructor(
    protected readonly chainsService: ChainsService,
    protected readonly keyRingService: KeyRingService
  ) {}

  async init() {
    // TODO: ?
  }

  async getKeySelected(env: Env, chainId: string): Promise<Key> {
    return await this.getKey(env, this.keyRingService.selectedVaultId, chainId);
  }

  async getKey(env: Env, vaultId: string, chainId: string): Promise<Key> {
    const chainInfo = this.chainsService.getChainInfoOrThrow(chainId);

    const pubKey = await this.keyRingService.getPubKey(env, chainId, vaultId);

    const isEthermintLike = this.isEthermintLike(chainInfo);
    const address = (() => {
      if (isEthermintLike) {
        return pubKey.getEthAddress();
      }

      return pubKey.getCosmosAddress();
    })();

    const bech32Address = new Bech32Address(address);

    return {
      name: this.keyRingService.getKeyRingNameSelected(),
      algo: isEthermintLike ? "ethsecp256k1" : "secp256k1",
      // TODO: Not sure we should return uncompressed pub key if ethermint.
      pubKey: pubKey.toBytes(),
      address,
      bech32Address: bech32Address.toBech32(
        chainInfo.bech32Config.bech32PrefixAccAddr
      ),
      // TODO
      isNanoLedger: false,
      isKeystone: false,
    };
  }

  protected isEthermintLike(chainInfo: ChainInfo): boolean {
    return (
      chainInfo.bip44.coinType === 60 ||
      !!chainInfo.features?.includes("eth-address-gen") ||
      !!chainInfo.features?.includes("eth-key-sign")
    );
  }
}
