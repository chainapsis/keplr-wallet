import { ChainsService } from "../chains";
import { VaultService } from "../vault";
import { KeyRingService } from "../keyring";
import { InteractionService } from "../interaction";
import { AnalyticsService } from "../analytics";
import { PermissionService } from "../permission";
import { PermissionInteractiveService } from "../permission-interactive";
import { BackgroundTxService } from "src/tx";
import {
  BitcoinSignMessageType,
  SupportedPaymentType,
} from "@keplr-wallet/types";
import { Env, KeplrError } from "@keplr-wallet/router";
import { Psbt, payments } from "bitcoinjs-lib";
import { encodeLegacyMessage, encodeLegacySignature } from "./helper";
import { toXOnly } from "@keplr-wallet/crypto";
import { BIP322 } from "./bip322";

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

    const network = this.getNetwork(chainId);

    let address: string | undefined;

    if (paymentType === SupportedPaymentType.NATIVE_SEGWIT) {
      const nativeSegwitAddress = bitcoinPubKey.getNativeSegwitAddress(network);
      if (nativeSegwitAddress) {
        address = nativeSegwitAddress;
      }
    } else {
      const taprootAddress = bitcoinPubKey.getTaprootAddress(network);
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
    psbt: Psbt
  ) {
    return await this.signPsbt(
      env,
      origin,
      this.keyRingService.selectedVaultId,
      chainId,
      psbt
    );
  }

  async signPsbtsSelected(
    env: Env,
    origin: string,
    chainId: string,
    psbts: Psbt[]
  ) {
    return await this.signPsbts(
      env,
      origin,
      this.keyRingService.selectedVaultId,
      chainId,
      psbts
    );
  }

  async signPsbts(
    env: Env,
    origin: string,
    vaultId: string,
    chainId: string,
    psbts: Psbt[]
  ) {
    const keyInfo = this.keyRingService.getKeyInfo(vaultId);
    if (!keyInfo) {
      throw new KeplrError("keyring", 221, "Null key info");
    }

    const bitcoinPubKey = await this.getBitcoinKeySelected(chainId);

    const network = this.getNetwork(chainId);

    return await this.interactionService.waitApproveV2(
      env,
      "/sign-bitcoin-psbt",
      "request-sign-bitcoin-psbt",
      {
        origin,
        vaultId,
        chainId,
        address: bitcoinPubKey.address,
        pubKey: bitcoinPubKey.pubKey,
        network,
        psbts,
        keyType: keyInfo.type,
        keyInsensitive: keyInfo.insensitive,
      },
      async (res: { signedPsbts: Psbt[] }) => {
        if (res.signedPsbts) {
          return res.signedPsbts.map((psbt) => psbt.toHex());
        }

        const signedPsbts = await Promise.all(
          psbts.map((psbt) =>
            this.keyRingService.signPsbt(chainId, vaultId, psbt)
          )
        );

        return signedPsbts.map((psbt) => psbt.toHex());
      }
    );
  }

  async signPsbt(
    env: Env,
    origin: string,
    vaultId: string,
    chainId: string,
    psbt: Psbt
  ) {
    const keyInfo = this.keyRingService.getKeyInfo(vaultId);
    if (!keyInfo) {
      throw new KeplrError("keyring", 221, "Null key info");
    }

    const bitcoinPubKey = await this.getBitcoinKeySelected(chainId);

    const network = this.getNetwork(chainId);

    return await this.interactionService.waitApproveV2(
      env,
      "/sign-bitcoin-psbt",
      "request-sign-bitcoin-psbt",
      {
        origin,
        vaultId,
        chainId,
        address: bitcoinPubKey.address,
        pubKey: bitcoinPubKey.pubKey,
        network,
        psbt,
        keyType: keyInfo.type,
        keyInsensitive: keyInfo.insensitive,
      },
      async (res: { signedPsbt: Psbt }) => {
        if (res.signedPsbt) {
          return res.signedPsbt.toHex();
        }

        const signedPsbt = await this.keyRingService.signPsbt(
          chainId,
          vaultId,
          psbt
        );

        return signedPsbt.toHex();
      }
    );
  }

  async signMessageSelected(
    env: Env,
    origin: string,
    chainId: string,
    message: string,
    signType: BitcoinSignMessageType
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
    signType: BitcoinSignMessageType
  ) {
    const keyInfo = this.keyRingService.getKeyInfo(vaultId);
    if (!keyInfo) {
      throw new KeplrError("keyring", 221, "Null key info");
    }

    const bitcoinPubKey = await this.getBitcoinKey(
      vaultId,
      chainId,
      signType === "message"
        ? SupportedPaymentType.NATIVE_SEGWIT
        : SupportedPaymentType.TAPROOT
    );

    const network = this.getNetwork(chainId);

    return await this.interactionService.waitApproveV2(
      env,
      "/sign-bitcoin-message",
      "request-sign-bitcoin-message",
      {
        origin,
        vaultId,
        chainId,
        address: bitcoinPubKey.address,
        pubKey: bitcoinPubKey.pubKey,
        network,
        message,
        signType,
        keyType: keyInfo.type,
        keyInsensitive: keyInfo.insensitive,
      },
      async (res: { message: string; signatureHex: string }) => {
        const { signatureHex } = res;
        if (signatureHex) {
          return signatureHex;
        }

        // legacy signature
        if (signType === "message") {
          const data = encodeLegacyMessage(network.messagePrefix, message);

          const sig = await this.keyRingService.sign(
            chainId,
            vaultId,
            data,
            "hash256"
          );

          const encodedSignature = encodeLegacySignature(
            sig.r,
            sig.s,
            sig.v ?? 0, // TODO: check if this is correct
            true,
            "p2wpkh"
          );

          return encodedSignature.toString("hex");
        }

        const internalPubkey = toXOnly(Buffer.from(bitcoinPubKey.pubKey));
        const p2tr = payments.p2tr({
          internalPubkey,
          network,
        });
        if (!p2tr.output) {
          throw new KeplrError("keyring", 221, "Invalid pubkey");
        }

        const txToSpend = BIP322.buildToSpendTx(message, p2tr.output);
        const txToSign = BIP322.buildToSignTx(
          txToSpend.getId(),
          p2tr.output,
          false,
          internalPubkey
        );

        const signedPsbt = await this.keyRingService.signPsbt(
          chainId,
          vaultId,
          txToSign
        );

        return BIP322.encodeWitness(signedPsbt);
      }
    );
  }

  async getSupportedPaymentTypes() {
    return [SupportedPaymentType.NATIVE_SEGWIT, SupportedPaymentType.TAPROOT];
  }

  private getNetwork(chainId: string) {
    const chainInfo = this.chainsService.getModularChainInfoOrThrow(chainId);
    if (!("bitcoin" in chainInfo)) {
      throw new KeplrError("keyring", 221, "Chain is not a bitcoin chain");
    }

    return {
      messagePrefix: chainInfo.bitcoin.messagePrefix,
      bech32: chainInfo.bitcoin.bech32,
      bip32: {
        public: -1,
        private: -1,
      },
      pubKeyHash: chainInfo.bitcoin.pubKeyHash,
      scriptHash: -1,
      wif: -1,
    };
  }
}
