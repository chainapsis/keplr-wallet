import { ChainsService } from "../chains";
import { VaultService } from "../vault";
import { KeyRingService } from "../keyring";
import { InteractionService } from "../interaction";
import { PermissionService } from "../permission";
import {
  BitcoinSignMessageType,
  GENESIS_HASH_TO_NETWORK,
  NETWORK_TO_GENESIS_HASH,
  GenesisHash,
  Network,
  SupportedPaymentType,
  ChainType,
  GENESIS_HASH_TO_CHAIN_TYPE,
  CHAIN_TYPE_TO_GENESIS_HASH,
  SignPsbtOptions,
} from "@keplr-wallet/types";
import { Env, KeplrError } from "@keplr-wallet/router";
import { Psbt, address } from "bitcoinjs-lib";
import { encodeLegacyMessage, encodeLegacySignature } from "./helper";
import { toXOnly } from "@keplr-wallet/crypto";
import { BIP322 } from "./bip322";
import { simpleFetch } from "@keplr-wallet/simple-fetch";
import { BackgroundTxService } from "../tx";
import validate, {
  Network as BitcoinNetwork,
} from "bitcoin-address-validation";
import { mainnet, signet, testnet } from "./constants";
import { AnalyticsService } from "../analytics";

const DUST_THRESHOLD = 546;
enum BitcoinSignType {
  MessageECDSA = "message-ecdsa",
  MessageBIP322 = "message-bip322",
  PSBT = "psbt",
  PSBTS = "psbts",
}

export class KeyRingBitcoinService {
  constructor(
    protected readonly chainsService: ChainsService,
    protected readonly vaultService: VaultService,
    protected readonly keyRingService: KeyRingService,
    protected readonly interactionService: InteractionService,
    protected readonly permissionService: PermissionService,
    protected readonly txService: BackgroundTxService,
    protected readonly analyticsService: AnalyticsService
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
    masterFingerprintHex?: string;
    derivationPath?: string;
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
      masterFingerprintHex: params.masterFingerprintHex,
      derivationPath: params.derivationPath,
    };
  }

  async getBitcoinKeySelected(chainId: string): Promise<{
    name: string;
    pubKey: Uint8Array;
    address: string;
    paymentType: SupportedPaymentType;
    isNanoLedger: boolean;
    masterFingerprintHex?: string;
    derivationPath?: string;
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
    masterFingerprintHex?: string;
    derivationPath?: string;
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
    const network = this.getNetworkConfig(chainId);

    const bitcoinPubKey = await this.keyRingService.getPubKeyBitcoin(
      chainId,
      vaultId,
      network
    );

    const address = bitcoinPubKey.getBitcoinAddress(paymentType);

    if (!address) {
      throw new KeplrError("keyring", 221, "No payment address found");
    }

    return {
      pubKey: bitcoinPubKey.toBytes(),
      address,
      paymentType,
      // only mnemonic key ring has master fingerprint and derivation path at this moment
      masterFingerprintHex: bitcoinPubKey.getMasterFingerprint(),
      derivationPath: bitcoinPubKey.getPath(),
    };
  }

  async signPsbtSelected(
    env: Env,
    origin: string,
    chainId: string,
    psbtHex: string,
    options?: SignPsbtOptions
  ) {
    return await this.signPsbt(
      env,
      origin,
      this.keyRingService.selectedVaultId,
      chainId,
      psbtHex,
      options
    );
  }

  async signPsbtsSelected(
    env: Env,
    origin: string,
    chainId: string,
    psbtsHexes: string[],
    options?: SignPsbtOptions
  ) {
    return await this.signPsbts(
      env,
      origin,
      this.keyRingService.selectedVaultId,
      chainId,
      psbtsHexes,
      options
    );
  }

  async signPsbts(
    env: Env,
    origin: string,
    vaultId: string,
    chainId: string,
    psbtsHexes: string[],
    options?: SignPsbtOptions
  ) {
    const keyInfo = this.keyRingService.getKeyInfo(vaultId);
    if (!keyInfo) {
      throw new KeplrError("keyring", 221, "Null key info");
    }

    const bitcoinPubKey = await this.getBitcoinKeySelected(chainId);

    const network = this.getNetworkConfig(chainId);

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
        signPsbtOptions: options,
        keyType: keyInfo.type,
        keyInsensitive: keyInfo.insensitive,
      },
      async (res: {
        psbtSignData: {
          psbtHex: string;
          inputsToSign: {
            index: number;
            address: string;
            hdPath?: string;
            tapLeafHashesToSign?: Buffer[];
            sighashTypes?: number[];
            disableTweakSigner?: boolean;
            useTweakedSigner?: boolean;
          }[];
        }[];
        signedPsbtsHexes: string[];
      }) => {
        if (
          res.signedPsbtsHexes &&
          res.signedPsbtsHexes.length === psbtsHexes.length
        ) {
          return res.signedPsbtsHexes;
        }

        const signedPsbts = await Promise.all(
          res.psbtSignData.map((psbtSignData) =>
            this.keyRingService.signPsbt(
              chainId,
              vaultId,
              Psbt.fromHex(psbtSignData.psbtHex),
              psbtSignData.inputsToSign,
              network,
              options
            )
          )
        );

        this.analyticsService.logEventIgnoreError("bitcoin_tx_signed", {
          chainId,
          bitcoinNetwork: network.id,
          isInternal: env.isInternalMsg,
          origin,
          keyType: keyInfo.type,
          bitcoinSignType: BitcoinSignType.PSBTS,
          bitcoinPaymentType: bitcoinPubKey.paymentType,
        });

        return signedPsbts.map((psbt) => psbt.toHex());
      }
    );
  }

  async signPsbt(
    env: Env,
    origin: string,
    vaultId: string,
    chainId: string,
    psbtHex: string,
    options?: SignPsbtOptions
  ) {
    const keyInfo = this.keyRingService.getKeyInfo(vaultId);
    if (!keyInfo) {
      throw new KeplrError("keyring", 221, "Null key info");
    }

    const bitcoinPubKey = await this.getBitcoinKeySelected(chainId);

    const network = this.getNetworkConfig(chainId);

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
        signPsbtOptions: options,
        keyType: keyInfo.type,
        keyInsensitive: keyInfo.insensitive,
      },
      async (res: {
        psbtSignData: {
          psbtHex: string;
          inputsToSign: {
            index: number;
            address: string;
            hdPath?: string;
            tapLeafHashesToSign?: Buffer[];
          }[];
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
          res.psbtSignData[0].inputsToSign,
          network,
          options
        );

        this.analyticsService.logEventIgnoreError("bitcoin_tx_signed", {
          chainId,
          bitcoinNetwork: network.id,
          isInternal: env.isInternalMsg,
          origin,
          keyType: keyInfo.type,
          bitcoinSignType: BitcoinSignType.PSBT,
          bitcoinPaymentType: bitcoinPubKey.paymentType,
        });

        return signedPsbt.toHex();
      }
    );
  }

  async signMessageSelected(
    env: Env,
    origin: string,
    chainId: string,
    message: string,
    signType?: BitcoinSignMessageType
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
    signType: BitcoinSignMessageType = BitcoinSignMessageType.ECDSA
  ) {
    const keyInfo = this.keyRingService.getKeyInfo(vaultId);
    if (!keyInfo) {
      throw new KeplrError("keyring", 221, "Null key info");
    }

    const bitcoinPubKey = await this.getBitcoinKey(vaultId, chainId);

    const network = this.getNetworkConfig(chainId);

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
      async (res: { message: string; signature: string }) => {
        const { signature } = res;
        if (signature) {
          return signature;
        }

        if (signType === BitcoinSignMessageType.ECDSA) {
          const sig = await this.keyRingService.sign(
            chainId,
            vaultId,
            encodeLegacyMessage(message),
            "hash256"
          );

          return encodeLegacySignature(
            sig.r,
            sig.s,
            sig.v!,
            true // @noble/curves/secp256k1 is using compressed pubkey
          );
        }

        const scriptPubKey = address.toOutputScript(
          bitcoinPubKey.address,
          network
        );
        const internalPubKey =
          bitcoinPubKey.paymentType === "taproot"
            ? toXOnly(Buffer.from(bitcoinPubKey.pubKey))
            : undefined;

        const txToSpend = BIP322.buildToSpendTx(message, scriptPubKey);
        const txToSign = BIP322.buildToSignTx(
          txToSpend.getId(),
          scriptPubKey,
          false,
          internalPubKey
        );

        const inputsToSign = Array.from(
          { length: txToSign.data.inputs.length },
          (_, i) => ({
            index: i,
            address: bitcoinPubKey.address,
            hdPath: bitcoinPubKey.derivationPath,
          })
        );

        const signedPsbt = await this.keyRingService.signPsbt(
          chainId,
          vaultId,
          txToSign,
          inputsToSign,
          network
        );

        this.analyticsService.logEventIgnoreError("bitcoin_tx_signed", {
          chainId,
          bitcoinNetwork: network.id,
          isInternal: env.isInternalMsg,
          origin,
          keyType: keyInfo.type,
          bitcoinSignType:
            signType === BitcoinSignMessageType.BIP322_SIMPLE
              ? BitcoinSignType.MessageBIP322
              : BitcoinSignType.MessageECDSA,
          bitcoinPaymentType: bitcoinPubKey.paymentType,
        });

        return BIP322.encodeWitness(signedPsbt);
      }
    );
  }

  getSupportedPaymentTypes(): SupportedPaymentType[] {
    return ["native-segwit", "taproot"];
  }

  private getNetworkConfig(chainId: string) {
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
      case Network.LIVENET:
        return mainnet;
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

  getCurrentChainId(origin: string, chainId?: string) {
    const currentBaseChainId =
      this.permissionService.getCurrentBaseChainIdForBitcoin(origin);
    if (currentBaseChainId == null) {
      return;
    }

    return chainId || `${currentBaseChainId}:taproot`;
  }

  forceGetCurrentChainId(origin: string, chainId?: string) {
    return (
      this.getCurrentChainId(origin, chainId) ||
      // If the current chain id is not set, use Bitcoin mainnet as the default chain id.
      "bip122:000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f:taproot"
    );
  }

  getNewCurrentChainIdFromNetwork(network: Network) {
    if (!network || (network && !Object.values(Network).includes(network))) {
      throw new Error(
        `Invalid parameters: must provide a valid network. Available networks: ${Object.values(
          Network
        ).join(", ")}`
      );
    }

    return `bip122:${NETWORK_TO_GENESIS_HASH[network]}:taproot`;
  }

  getNewCurrentChainIdFromChainType(chainType: ChainType) {
    if (
      !chainType ||
      (chainType && !Object.values(ChainType).includes(chainType))
    ) {
      throw new Error(
        `Invalid parameters: must provide a valid chain. Available chains: ${Object.values(
          ChainType
        ).join(", ")}`
      );
    }

    return `bip122:${CHAIN_TYPE_TO_GENESIS_HASH[chainType]}:taproot`;
  }

  async getAccounts(origin: string) {
    const currentChainId = this.getCurrentChainId(origin);
    if (!currentChainId) {
      return [];
    }

    const bitcoinKey = await this.getBitcoinKeySelected(currentChainId);

    return [bitcoinKey.address];
  }

  async requestAccounts(origin: string) {
    const currentChainId = this.forceGetCurrentChainId(origin);
    const bitcoinKey = await this.getBitcoinKeySelected(currentChainId);

    return [bitcoinKey.address];
  }

  async disconnect(origin: string) {
    const currentChainId = this.forceGetCurrentChainId(origin);

    return this.permissionService.removeAllTypePermissionToChainId(
      currentChainId,
      [origin]
    );
  }

  getNetwork(origin: string) {
    const currentChainId = this.forceGetCurrentChainId(origin);
    return this.getNetworkConfig(currentChainId).id.replace(
      Network.MAINNET,
      Network.LIVENET
    ) as Network;
  }

  async switchNetwork(env: Env, origin: string, network: Network) {
    const currentChainId = this.getCurrentChainId(origin);
    const newCurrentChainId = this.getNewCurrentChainIdFromNetwork(network);
    if (currentChainId === newCurrentChainId) {
      return network;
    }

    await this.permissionService.updateCurrentBaseChainIdForBitcoin(
      env,
      origin,
      newCurrentChainId
    );

    return network;
  }

  getChain(origin: string) {
    const currentChainId = this.forceGetCurrentChainId(origin);
    const { genesisHash } = this.parseChainId(currentChainId);
    const chainType = GENESIS_HASH_TO_CHAIN_TYPE[genesisHash];
    const currentChainInfo =
      this.chainsService.getModularChainInfoOrThrow(currentChainId);
    const network = this.getNetworkConfig(currentChainId).id;

    return {
      enum: chainType,
      name: currentChainInfo.chainName,
      network,
    };
  }

  async switchChain(env: Env, origin: string, chainType: ChainType) {
    const currentChainId = this.forceGetCurrentChainId(origin);
    const newCurrentChainId = this.getNewCurrentChainIdFromChainType(chainType);
    if (currentChainId === newCurrentChainId) {
      return chainType;
    }

    await this.permissionService.updateCurrentBaseChainIdForBitcoin(
      env,
      origin,
      newCurrentChainId
    );

    return chainType;
  }

  async getPublicKey(origin: string) {
    const currentChainId = this.forceGetCurrentChainId(origin);
    const bitcoinKey = await this.getBitcoinKeySelected(currentChainId);

    return Buffer.from(bitcoinKey.pubKey).toString("hex");
  }

  async getBalance(origin: string) {
    const currentChainId = this.forceGetCurrentChainId(origin);
    const bitcoinKey = await this.getBitcoinKeySelected(currentChainId);
    const bitcoinChainInfo =
      this.chainsService.getBitcoinChainInfoOrThrow(currentChainId);

    const res = await simpleFetch<{
      address: string;
      chain_stats: {
        funded_txo_count: number;
        funded_txo_sum: number;
        spent_txo_count: number;
        spent_txo_sum: number;
        tx_count: number;
      };
      mempool_stats: {
        funded_txo_count: number;
        funded_txo_sum: number;
        spent_txo_count: number;
        spent_txo_sum: number;
        tx_count: number;
      };
    }>(`${bitcoinChainInfo.rest}/address/${bitcoinKey.address}`);

    const confirmed =
      res.data.chain_stats.funded_txo_sum - res.data.chain_stats.spent_txo_sum;
    const unconfirmed =
      res.data.mempool_stats.funded_txo_sum -
      res.data.mempool_stats.spent_txo_sum;

    return {
      confirmed,
      unconfirmed,
      total: confirmed + unconfirmed,
    };
  }

  async getInscriptions() {
    throw new Error("Not implemented.");
  }

  async sendBitcoin(
    env: Env,
    origin: string,
    toAddress: string,
    amount: number
  ) {
    const currentChainId = this.forceGetCurrentChainId(origin);

    let isValidAddress;
    try {
      const network = this.getNetworkConfig(currentChainId).id;

      isValidAddress = validate(
        toAddress,
        network as unknown as BitcoinNetwork,
        {
          castTestnetTo:
            network === "signet" ? BitcoinNetwork.signet : undefined,
        }
      );
    } catch {
      isValidAddress = false;
    }
    if (!isValidAddress) {
      throw new Error("Invalid parameters: must provide a valid to address.");
    }

    if (typeof amount !== "number") {
      throw new Error("Invalid parameters: must provide an amount as number.");
    }
    if (amount < DUST_THRESHOLD) {
      throw new Error(
        "Invalid parameters: must provide an amount greater than 546."
      );
    }

    const vaultId = this.keyRingService.selectedVaultId;
    const keyInfo = this.keyRingService.getKeyInfo(vaultId);
    if (!keyInfo) {
      throw new KeplrError("keyring", 221, "Null key info");
    }
    const bitcoinPubKey = await this.getBitcoinKeySelected(currentChainId);
    const network = this.getNetworkConfig(currentChainId);
    const signedPsbtHex = await this.interactionService.waitApproveV2(
      env,
      "/sign-bitcoin-tx",
      "request-sign-bitcoin-psbt",
      {
        origin,
        vaultId,
        chainId: currentChainId,
        address: bitcoinPubKey.address,
        pubKey: bitcoinPubKey.pubKey,
        network,
        keyType: keyInfo.type,
        keyInsensitive: keyInfo.insensitive,
        psbtCandidate: {
          toAddress,
          amount,
        },
      },
      async (res: {
        psbtSignData: {
          psbtHex: string;
          inputsToSign: {
            index: number;
            address: string;
            hdPath?: string;
            tapLeafHashesToSign?: Buffer[];
          }[];
        }[];
        signedPsbtsHexes: string[];
      }) => {
        if (res.signedPsbtsHexes && res.signedPsbtsHexes.length > 0) {
          return res.signedPsbtsHexes[0];
        }

        if (res.psbtSignData.length === 0) {
          throw new KeplrError("keyring", 221, "No psbt sign data");
        }

        const psbt = Psbt.fromHex(res.psbtSignData[0].psbtHex, {
          network,
        });

        const signedPsbt = await this.keyRingService.signPsbt(
          currentChainId,
          vaultId,
          psbt,
          res.psbtSignData[0].inputsToSign,
          network
        );

        return signedPsbt.toHex();
      }
    );

    const tx = Psbt.fromHex(signedPsbtHex).extractTransaction();
    const txHex = tx.toHex();

    return this.txService.pushBitcoinTransaction(currentChainId, txHex);
  }

  async pushTx(origin: string, rawTxHex: string) {
    const currentChainId = this.forceGetCurrentChainId(origin);

    return this.txService.pushBitcoinTransaction(currentChainId, rawTxHex);
  }
}
