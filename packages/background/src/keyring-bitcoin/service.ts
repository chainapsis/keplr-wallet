import { ChainsService } from "../chains";
import { VaultService } from "../vault";
import { KeyRingService } from "../keyring";
import { InteractionService } from "../interaction";
import { PermissionService } from "../permission";
import {
  BitcoinSignMessageType,
  GENESIS_HASH_TO_NETWORK,
  GenesisHash,
  Network,
  SupportedPaymentType,
} from "@keplr-wallet/types";
import { Env, KeplrError } from "@keplr-wallet/router";
import { Psbt, payments } from "bitcoinjs-lib";
import { mainnet, signet, testnet } from "./constants";
import { encodeLegacyMessage, encodeLegacySignature } from "./helper";
import { toXOnly } from "@keplr-wallet/crypto";
import { BIP322 } from "./bip322";

export class KeyRingBitcoinService {
  constructor(
    protected readonly chainsService: ChainsService,
    protected readonly vaultService: VaultService,
    protected readonly keyRingService: KeyRingService,
    protected readonly interactionService: InteractionService,
    protected readonly permissionService: PermissionService
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
    address: string;
    paymentType: SupportedPaymentType;
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
      address: params.address,
      paymentType: params.paymentType,
      isNanoLedger: keyInfo.type === "ledger",
    };
  }

  async getBitcoinKeySelected(chainId: string): Promise<{
    name: string;
    pubKey: Uint8Array;
    address: string;
    paymentType: SupportedPaymentType;
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

    const { paymentType } = this.parseChainId(chainId);

    // TODO: Ledger support
    // const isLedger = vault.insensitive["keyRingType"] === "ledger";

    const bitcoinPubKey = (
      await this.keyRingService.getPubKey(chainId, vaultId)
    ).toBitcoinPubKey();

    const network = this.getNetwork(chainId);

    let address: string | undefined;

    if (paymentType === "native-segwit") {
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
      paymentType,
    };
  }

  async signPsbtSelected(
    env: Env,
    origin: string,
    chainId: string,
    psbtHex: string
  ) {
    return await this.signPsbt(
      env,
      origin,
      this.keyRingService.selectedVaultId,
      chainId,
      psbtHex
    );
  }

  async signPsbtsSelected(
    env: Env,
    origin: string,
    chainId: string,
    psbtsHexes: string[]
  ) {
    return await this.signPsbts(
      env,
      origin,
      this.keyRingService.selectedVaultId,
      chainId,
      psbtsHexes
    );
  }

  async signPsbts(
    env: Env,
    origin: string,
    vaultId: string,
    chainId: string,
    psbtsHexes: string[]
  ) {
    const keyInfo = this.keyRingService.getKeyInfo(vaultId);
    if (!keyInfo) {
      throw new KeplrError("keyring", 221, "Null key info");
    }

    const bitcoinPubKey = await this.getBitcoinKeySelected(chainId);

    const network = this.getNetwork(chainId);

    return await this.interactionService.waitApproveV2(
      env,
      "/sign-bitcoin-tx",
      "request-sign-bitcoin-psbt",
      {
        origin,
        vaultId,
        chainId,
        address: bitcoinPubKey.address,
        pubKey: bitcoinPubKey.pubKey,
        network,
        psbtsHexes,
        keyType: keyInfo.type,
        keyInsensitive: keyInfo.insensitive,
      },
      async (res: {
        psbtSignData: {
          psbtHex: string;
          inputsToSign: number[];
        }[];
        signedPsbtsHexes: string[];
      }) => {
        if (res.signedPsbtsHexes) {
          return res.signedPsbtsHexes;
        }

        const signedPsbts = await Promise.all(
          res.psbtSignData.map((psbtSignData) =>
            this.keyRingService.signPsbt(
              chainId,
              vaultId,
              Psbt.fromHex(psbtSignData.psbtHex),
              psbtSignData.inputsToSign
            )
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
    psbtHex: string
  ) {
    const keyInfo = this.keyRingService.getKeyInfo(vaultId);
    if (!keyInfo) {
      throw new KeplrError("keyring", 221, "Null key info");
    }

    const bitcoinPubKey = await this.getBitcoinKeySelected(chainId);

    const network = this.getNetwork(chainId);

    return await this.interactionService.waitApproveV2(
      env,
      "/sign-bitcoin-tx",
      "request-sign-bitcoin-psbt",
      {
        origin,
        vaultId,
        chainId,
        address: bitcoinPubKey.address,
        pubKey: bitcoinPubKey.pubKey,
        network,
        psbtHex,
        keyType: keyInfo.type,
        keyInsensitive: keyInfo.insensitive,
      },
      async (res: {
        psbtSignData: {
          psbtHex: string;
          inputsToSign: number[];
        }[];
        signedPsbtsHexes: string[];
      }) => {
        if (res.signedPsbtsHexes && res.signedPsbtsHexes.length > 0) {
          return res.signedPsbtsHexes[0];
        }

        if (res.psbtSignData.length === 0) {
          throw new KeplrError("keyring", 221, "No psbt sign data");
        }

        const psbt = Psbt.fromHex(res.psbtSignData[0].psbtHex, { network });

        const signedPsbt = await this.keyRingService.signPsbt(
          chainId,
          vaultId,
          psbt,
          res.psbtSignData[0].inputsToSign
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

    const bitcoinPubKey = await this.getBitcoinKey(vaultId, chainId);

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
            sig.v!,
            true, // @noble/curves/secp256k1 is using compressed pubkey
            "p2wpkh"
          );

          return encodedSignature.toString("hex");
        }

        const internalPubkey = toXOnly(Buffer.from(bitcoinPubKey.pubKey));
        const { output: scriptPubKey } = payments.p2tr({
          internalPubkey,
          network,
        });
        if (!scriptPubKey) {
          throw new KeplrError("keyring", 221, "Invalid pubkey");
        }

        const txToSpend = BIP322.buildToSpendTx(message, scriptPubKey);
        const txToSign = BIP322.buildToSignTx(
          txToSpend.getId(),
          scriptPubKey,
          false,
          internalPubkey
        );

        const signedPsbt = await this.keyRingService.signPsbt(
          chainId,
          vaultId,
          txToSign,
          Array.from({ length: txToSign.data.inputs.length }, (_, i) => i)
        );

        return BIP322.encodeWitness(signedPsbt);
      }
    );
  }

  getSupportedPaymentTypes(): SupportedPaymentType[] {
    return ["native-segwit", "taproot"];
  }

  private getNetwork(chainId: string) {
    const chainInfo = this.chainsService.getModularChainInfoOrThrow(chainId);
    if (!("bitcoin" in chainInfo)) {
      throw new KeplrError("keyring", 221, "Chain is not a bitcoin chain");
    }

    const { genesisHash } = this.parseChainId(chainId);
    const network = GENESIS_HASH_TO_NETWORK[genesisHash];

    switch (network) {
      case Network.MAINNET:
        return mainnet;
      case Network.TESTNET:
        return testnet;
      case Network.SIGNET:
        return signet;
    }
  }

  private parseChainId(chainId: string): {
    genesisHash: GenesisHash;
    paymentType: SupportedPaymentType;
  } {
    // {bip122}:{genesisHash}:{paymentType}
    const split = chainId.split(":");
    if (split.length < 3) {
      throw new KeplrError("keyring", 221, "Invalid bitcoin chain id");
    }

    const supportedPaymentTypes = this.getSupportedPaymentTypes();
    if (!supportedPaymentTypes.includes(split[2] as SupportedPaymentType)) {
      throw new KeplrError("keyring", 221, "Invalid payment type");
    }

    return {
      genesisHash: split[1] as GenesisHash,
      paymentType: split[2] as SupportedPaymentType,
    };
  }
}
