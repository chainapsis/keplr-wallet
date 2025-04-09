import { ChainsService } from "../chains";
import { VaultService } from "../vault";
import { KeyRingService } from "../keyring";
import { InteractionService } from "../interaction";
import { getBasicAccessPermissionType, PermissionService } from "../permission";
import {
  BitcoinSignMessageType,
  GENESIS_HASH_TO_NETWORK,
  NETWORK_TO_GENESIS_HASH,
  GenesisHash,
  IBitcoinProvider,
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
    const network = this.getNetwork(chainId);

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

  async requestMethod<T = any>(
    env: Env,
    origin: string,
    method: keyof IBitcoinProvider,
    params?: unknown[],
    chainId?: string
  ) {
    if (env.isInternalMsg && chainId == null) {
      throw new Error(
        "The chain id must be provided for the internal message."
      );
    }

    const currentBaseChainId =
      this.permissionService.getCurrentBaseChainIdForBitcoin(origin) ??
      (chainId ? this.chainsService.getBaseChainId(chainId) : undefined);

    if (currentBaseChainId == null) {
      if (method === "getAccounts") {
        return [] as T;
      }

      throw new Error(
        `${origin} is not permitted. Please disconnect and reconnect to the website.`
      );
    }

    // Taproot is default so specify the chain id.
    const currentChainId = `${currentBaseChainId}:taproot`;

    const result = (
      await (async () => {
        switch (method) {
          // This method is not ensured permission in the handler.
          case "getAccounts": {
            const hasPermission = this.permissionService.hasPermission(
              currentBaseChainId,
              getBasicAccessPermissionType(),
              origin
            );

            return hasPermission
              ? [(await this.getBitcoinKeySelected(currentChainId)).address]
              : [];
          }
          case "requestAccounts": {
            return [(await this.getBitcoinKeySelected(currentChainId)).address];
          }
          case "disconnect": {
            return this.permissionService.removeAllTypePermissionToChainId(
              currentBaseChainId,
              [origin]
            );
          }
          case "getNetwork": {
            return this.getNetwork(currentChainId).id.replace(
              Network.MAINNET,
              Network.LIVENET
            );
          }
          case "switchNetwork": {
            const network =
              (Array.isArray(params) && (params?.[0] as Network)) || undefined;
            if (
              !network ||
              (network && !Object.values(Network).includes(network))
            ) {
              throw new Error(
                `Invalid parameters: must provide a valid network. Available networks: ${Object.values(
                  Network
                ).join(", ")}`
              );
            }

            const genesisHash = NETWORK_TO_GENESIS_HASH[network];
            const newCurrentBaseChainId = `bip122:${genesisHash}`;

            await this.permissionService.updateCurrentBaseChainIdForBitcoin(
              env,
              origin,
              newCurrentBaseChainId
            );

            return network;
          }
          case "getChain": {
            const { genesisHash } = this.parseChainId(currentChainId);
            const chainType = GENESIS_HASH_TO_CHAIN_TYPE[genesisHash];
            const currentChainInfo =
              this.chainsService.getModularChainInfoOrThrow(currentChainId);
            const network = this.getNetwork(currentChainId).id;

            return {
              enum: chainType,
              name: currentChainInfo.chainName,
              network,
            };
          }
          case "switchChain": {
            const chain =
              (Array.isArray(params) && (params?.[0] as ChainType)) ||
              undefined;
            if (
              !chain ||
              (chain && !Object.values(ChainType).includes(chain))
            ) {
              throw new Error(
                `Invalid parameters: must provide a valid chain. Available chains: ${Object.values(
                  ChainType
                ).join(", ")}`
              );
            }

            const genesisHash = CHAIN_TYPE_TO_GENESIS_HASH[chain];
            const newCurrentBaseChainId = `bip122:${genesisHash}`;

            await this.permissionService.updateCurrentBaseChainIdForBitcoin(
              env,
              origin,
              newCurrentBaseChainId
            );

            return chain;
          }
          case "getPublicKey": {
            const bitcoinKey = await this.getBitcoinKeySelected(currentChainId);
            return Buffer.from(bitcoinKey.pubKey).toString("hex");
          }
          case "getBalance": {
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
              res.data.chain_stats.funded_txo_sum -
              res.data.chain_stats.spent_txo_sum;
            const unconfirmed =
              res.data.mempool_stats.funded_txo_sum -
              res.data.mempool_stats.spent_txo_sum;

            return {
              confirmed,
              unconfirmed,
              total: confirmed + unconfirmed,
            };
          }
          case "getInscriptions": {
            throw new Error("Not implemented.");
          }
          case "signMessage": {
            if (
              !Array.isArray(params) ||
              (Array.isArray(params) && params.length !== 2)
            ) {
              throw new Error("Invalid parameters: must provide 2 parameters.");
            }

            if (typeof params[0] !== "string") {
              throw new Error(
                "Invalid parameters: must provide a message as string."
              );
            }

            if (
              !Object.values(BitcoinSignMessageType).includes(
                params[1] as BitcoinSignMessageType
              )
            ) {
              throw new Error(
                `Invalid parameters: must provide a valid sign type: ${Object.values(
                  BitcoinSignMessageType
                ).join(", ")}`
              );
            }

            return this.signMessageSelected(
              env,
              origin,
              currentChainId,
              params[0] as string,
              params[1] as BitcoinSignMessageType
            );
          }
          case "sendBitcoin": {
            if (
              !Array.isArray(params) ||
              (Array.isArray(params) && params.length !== 2)
            ) {
              throw new Error("Invalid parameters: must provide 2 parameters.");
            }

            const [toAddress, amount] = params;

            if (typeof toAddress !== "string") {
              throw new Error(
                "Invalid parameters: must provide a to address as string."
              );
            }
            let isValidAddress;
            try {
              const network = this.getNetwork(currentChainId).id;

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
              throw new Error(
                "Invalid parameters: must provide a valid to address."
              );
            }

            if (typeof amount !== "number") {
              throw new Error(
                "Invalid parameters: must provide an amount as number."
              );
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
            const bitcoinPubKey = await this.getBitcoinKeySelected(
              currentChainId
            );
            const network = this.getNetwork(currentChainId);
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
          case "pushTx": {
            const rawTxHex =
              Array.isArray(params) && params.length > 0
                ? (params[0] as string)
                : undefined;
            if (typeof rawTxHex !== "string") {
              throw new Error(
                "Invalid parameters: must provide a psbt hex as string."
              );
            }

            return this.txService.pushBitcoinTransaction(
              currentChainId,
              rawTxHex
            );
          }
          case "signPsbt": {
            if (
              !Array.isArray(params) ||
              (Array.isArray(params) &&
                params.length !== 2 &&
                params.length !== 1)
            ) {
              throw new Error(
                "Invalid parameters: must provide 1 or 2 parameters."
              );
            }

            const psbtHex = params[0] as string;
            if (typeof psbtHex !== "string") {
              throw new Error(
                "Invalid parameters: must provide a psbt hex as a string."
              );
            }

            return this.signPsbtSelected(
              env,
              origin,
              currentChainId,
              psbtHex,
              params[1] as SignPsbtOptions
            );
          }
          case "signPsbts": {
            if (
              !Array.isArray(params) ||
              (Array.isArray(params) &&
                params.length !== 2 &&
                params.length !== 1)
            ) {
              throw new Error(
                "Invalid parameters: must provide 1 or 2 parameters."
              );
            }

            const psbtsHexes = params[0] as string[];
            if (
              !Array.isArray(psbtsHexes) ||
              psbtsHexes.some((hex) => typeof hex !== "string")
            ) {
              throw new Error(
                "Invalid parameters: must provide an array of psbt hex as a string."
              );
            }

            return this.signPsbtsSelected(
              env,
              origin,
              currentChainId,
              psbtsHexes,
              params[1] as SignPsbtOptions
            );
          }
        }
      })
    )() as T;

    return result;
  }
}
