import { ChainsService } from "../chains";
import { VaultService } from "../vault";
import { KeyRingService } from "../keyring";
import { InteractionService } from "../interaction";
import { AnalyticsService } from "../analytics";
import { PermissionService } from "../permission";
import { PermissionInteractiveService } from "../permission-interactive";
import { BackgroundTxService } from "src/tx";
import { SupportedPaymentType } from "@keplr-wallet/types";
import { KeplrError } from "@keplr-wallet/router";

export class KeyRingBitcoinService {
  constructor(
    protected readonly chainsService: ChainsService,
    protected readonly vaultService: VaultService,
    protected readonly keyRingService: KeyRingService,
    protected readonly interactionService: InteractionService,
    protected readonly analyticsService: AnalyticsService,
    protected readonly permissionService: PermissionService,
    protected readonly permissionInteractiveService: PermissionInteractiveService,
    protected readonly backgroundTxService: BackgroundTxService
  ) {}

  async init() {
    // noop
  }

  async getBitcoinKey(
    vaultId: string,
    chainId: string
  ): Promise<{
    name: string;
    pubKey: Uint8Array;
    addresses: {
      address: string;
      paymentType: SupportedPaymentType;
    }[];
    isNanoLedger: boolean;
  }> {
    const keyInfo = this.keyRingService.getKeyInfo(vaultId);
    if (!keyInfo) {
      throw new KeplrError("keyring", 221, "Null key info");
    }

    const params = await this.getBitcoinKeyParams(vaultId, chainId);

    return {
      name: keyInfo.name,
      pubKey: params.pubKey,
      addresses: params.addresses,
      isNanoLedger: keyInfo.type === "ledger",
    };
  }

  async getBitcoinKeySelected(chainId: string): Promise<{
    name: string;
    pubKey: Uint8Array;
    addresses: {
      address: string;
      paymentType: SupportedPaymentType;
    }[];
    isNanoLedger: boolean;
  }> {
    return await this.getBitcoinKey(
      this.keyRingService.selectedVaultId,
      chainId
    );
  }

  async getBitcoinKeyParams(
    vaultId: string,
    chainId: string
  ): Promise<{
    pubKey: Uint8Array;
    addresses: {
      address: string;
      paymentType: SupportedPaymentType;
    }[];
  }> {
    const chainInfo = this.chainsService.getModularChainInfoOrThrow(chainId);
    if (!("bitcoin" in chainInfo)) {
      throw new KeplrError("keyring", 221, "Chain is not a bitcoin chain");
    }

    const vault = this.vaultService.getVault("keyRing", vaultId);
    if (!vault) {
      throw new KeplrError("keyring", 221, "Vault not found");
    }

    // TODO: Ledger support
    // const isLedger = vault.insensitive["keyRingType"] === "ledger";

    const bitcoinPubKey = (
      await this.keyRingService.getPubKey(chainId, vaultId)
    ).toBitcoinPubKey();

    const addresses: {
      address: string;
      paymentType: SupportedPaymentType;
    }[] = [];

    const nativeSegwitAddress = bitcoinPubKey.getNativeSegwitAddress();
    if (nativeSegwitAddress) {
      addresses.push({
        address: nativeSegwitAddress,
        paymentType: SupportedPaymentType.NATIVE_SEGWIT,
      });
    }

    const taprootAddress = bitcoinPubKey.getTaprootAddress();
    if (taprootAddress) {
      addresses.push({
        address: taprootAddress,
        paymentType: SupportedPaymentType.TAPROOT,
      });
    }

    if (addresses.length === 0) {
      throw new KeplrError("keyring", 221, "No payment address found");
    }

    return {
      pubKey: bitcoinPubKey.toBytes(),
      addresses,
    };
  }
}
