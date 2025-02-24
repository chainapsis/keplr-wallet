import { ChainsService } from "../chains";
import { VaultService } from "../vault";
import { KeyRingService } from "../keyring";
import { InteractionService } from "../interaction";
import { AnalyticsService } from "../analytics";
import { PermissionService } from "../permission";
import { PermissionInteractiveService } from "../permission-interactive";
import { BackgroundTxService } from "src/tx";
import { SupportedPaymentType } from "@keplr-wallet/types";
import { Env, KeplrError } from "@keplr-wallet/router";
import { Psbt } from "bitcoinjs-lib";

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
    chainId: string,
    paymentType?: SupportedPaymentType
  ): Promise<{
    name: string;
    pubKey: Uint8Array;
    address: string;
    paymentType: SupportedPaymentType;
    isNanoLedger: boolean;
  }> {
    const keyInfo = this.keyRingService.getKeyInfo(vaultId);
    if (!keyInfo) {
      throw new KeplrError("keyring", 221, "Null key info");
    }

    const params = await this.getBitcoinKeyParams(
      vaultId,
      chainId,
      paymentType
    );

    return {
      name: keyInfo.name,
      pubKey: params.pubKey,
      address: params.address,
      paymentType: params.paymentType,
      isNanoLedger: keyInfo.type === "ledger",
    };
  }

  async getBitcoinKeySelected(
    chainId: string,
    paymentType?: SupportedPaymentType
  ): Promise<{
    name: string;
    pubKey: Uint8Array;
    address: string;
    paymentType: SupportedPaymentType;
    isNanoLedger: boolean;
  }> {
    return await this.getBitcoinKey(
      this.keyRingService.selectedVaultId,
      chainId,
      paymentType
    );
  }

  async getBitcoinKeyParams(
    vaultId: string,
    chainId: string,
    paymentType?: SupportedPaymentType
  ): Promise<{
    pubKey: Uint8Array;
    address: string;
    paymentType: SupportedPaymentType;
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

    let address: string | undefined;

    if (paymentType) {
      if (paymentType === SupportedPaymentType.NATIVE_SEGWIT) {
        const nativeSegwitAddress = bitcoinPubKey.getNativeSegwitAddress();
        if (nativeSegwitAddress) {
          address = nativeSegwitAddress;
        }
      }

      if (paymentType === SupportedPaymentType.TAPROOT) {
        const taprootAddress = bitcoinPubKey.getTaprootAddress();
        if (taprootAddress) {
          address = taprootAddress;
        }
      }
    } else {
      const taprootAddress = bitcoinPubKey.getTaprootAddress(); // taproot address by default
      if (taprootAddress) {
        address = taprootAddress;
      }
    }

    if (!address) {
      throw new KeplrError("keyring", 221, "No payment address found");
    }

    return {
      pubKey: bitcoinPubKey.toBytes(),
      address,
      paymentType: paymentType || SupportedPaymentType.TAPROOT,
    };
  }

  async signPsbtSelected(
    env: Env,
    origin: string,
    chainId: string,
    psbt: Psbt,
    checkOrdinals: boolean
  ) {
    return await this.signPsbt(
      env,
      origin,
      this.keyRingService.selectedVaultId,
      chainId,
      psbt,
      checkOrdinals
    );
  }

  async signPsbtsSelected(
    env: Env,
    origin: string,
    chainId: string,
    psbts: Psbt[],
    checkOrdinals: boolean
  ) {
    return await this.signPsbts(
      env,
      origin,
      this.keyRingService.selectedVaultId,
      chainId,
      psbts,
      checkOrdinals
    );
  }

  async signPsbts(
    env: Env,
    origin: string,
    vaultId: string,
    chainId: string,
    psbts: Psbt[],
    checkOrdinals: boolean
  ) {
    return await Promise.all(
      psbts.map((psbt) =>
        this.signPsbt(env, origin, vaultId, chainId, psbt, checkOrdinals)
      )
    );
  }

  async signPsbt(
    env: Env,
    origin: string,
    vaultId: string,
    chainId: string,
    psbt: Psbt,
    checkOrdinals: boolean
  ) {
    return "0x01";
  }

  async signMessageSelected(
    env: Env,
    origin: string,
    chainId: string,
    message: string,
    signType: "ecdsa" | "bip322-simple"
  ) {
    return await this.signMessage(
      env,
      origin,
      this.keyRingService.selectedVaultId,
      chainId,
      message,
      signType
    );
  }

  async signMessage(
    env: Env,
    origin: string,
    vaultId: string,
    chainId: string,
    message: string,
    signType: "ecdsa" | "bip322-simple"
  ) {
    return "0x01";
  }
}
