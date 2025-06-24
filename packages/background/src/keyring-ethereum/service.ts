import { ChainsService } from "../chains";
import { KeyRingService } from "../keyring";
import { InteractionService } from "../interaction";
import { AnalyticsService } from "../analytics";
import {
  Env,
  EthereumProviderRpcError,
  WEBPAGE_PORT,
} from "@keplr-wallet/router";
import {
  ChainInfo,
  EthereumSignResponse,
  EthSignType,
  EthTransactionType,
} from "@keplr-wallet/types";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { Buffer } from "buffer/";
import {
  domainHash,
  EIP712MessageValidator,
  KeyRingCosmosService,
  messageHash,
} from "../keyring-cosmos";
import { simpleFetch } from "@keplr-wallet/simple-fetch";
import { getBasicAccessPermissionType, PermissionService } from "../permission";
import { BackgroundTxEthereumService } from "../tx-ethereum";
import { TokenERC20Service } from "../token-erc20";
import { validateEVMChainId } from "./helper";
import { runInAction } from "mobx";
import { PermissionInteractiveService } from "../permission-interactive";
import { enableAccessSkippedEVMJSONRPCMethods } from "./constants";
import {
  Transaction,
  TransactionLike,
  TransactionReceipt,
  id as generateRequestId,
  hashAuthorization,
  isAddress,
} from "ethers";
import { hexValue } from "@ethersproject/bytes";
import { RecentSendHistoryService } from "../recent-send-history";
import {
  BatchSigningData,
  Capabilities,
  DELEGATOR_ADDRESS,
  EthereumBatchSignResponse,
  InternalSendCallsRequest,
  WalletGetCallStatusResponse,
  WalletGetCallStatusResponseStatus,
  WalletSendCallsRequest,
  WalletSendCallsResponse,
} from "./types";

export class KeyRingEthereumService {
  protected websocketSubscriptionMap = new Map<string, WebSocket>();

  constructor(
    protected readonly chainsService: ChainsService,
    protected readonly keyRingService: KeyRingService,
    // XXX: 미래에는 cosmos와 분리되어서 ethereum을 다뤄야하는데 현재는 그냥 ethermint 계열에서만 작동하기 때문에
    //      keyring-cosmos의 기능들도 사용한다.
    protected readonly keyRingCosmosService: KeyRingCosmosService,
    protected readonly interactionService: InteractionService,
    protected readonly analyticsService: AnalyticsService,
    protected readonly permissionService: PermissionService,
    protected readonly permissionInteractiveService: PermissionInteractiveService,
    protected readonly backgroundTxEthereumService: BackgroundTxEthereumService,
    protected readonly tokenERC20Service: TokenERC20Service,
    protected readonly recentSendHistoryService: RecentSendHistoryService
  ) {}

  async init() {
    // TODO: ?
  }

  // 오버로드: EIP5792 타입일 때 배치 응답 반환
  async signEthereumSelected(
    env: Env,
    origin: string,
    chainId: string,
    signer: string,
    message: Uint8Array,
    signType: EthSignType.EIP5792
  ): Promise<EthereumBatchSignResponse>;

  // 오버로드: 다른 타입일 때 일반 응답 반환
  async signEthereumSelected(
    env: Env,
    origin: string,
    chainId: string,
    signer: string,
    message: Uint8Array,
    signType: EthSignType.MESSAGE | EthSignType.TRANSACTION | EthSignType.EIP712
  ): Promise<EthereumSignResponse>;

  // 실제 구현
  async signEthereumSelected(
    env: Env,
    origin: string,
    chainId: string,
    signer: string,
    message: Uint8Array,
    signType: EthSignType
  ): Promise<EthereumSignResponse | EthereumBatchSignResponse> {
    if (signType === EthSignType.EIP5792) {
      return await this.signEthereumBatch(
        env,
        origin,
        this.keyRingService.selectedVaultId,
        chainId,
        signer,
        message
      );
    }

    return await this.signEthereum(
      env,
      origin,
      this.keyRingService.selectedVaultId,
      chainId,
      signer,
      message,
      signType
    );
  }

  async signEthereum(
    env: Env,
    origin: string,
    vaultId: string,
    chainId: string,
    signer: string,
    message: Uint8Array,
    signType: EthSignType
  ): Promise<EthereumSignResponse> {
    // EIP-5792 batch transactions should use signEthereumBatch method
    if (signType === EthSignType.EIP5792) {
      throw new EthereumProviderRpcError(
        -32602,
        "Invalid params",
        "EIP-5792 batch transactions must use signEthereumBatch method."
      );
    }

    const chainInfo = this.chainsService.getChainInfoOrThrow(chainId);
    if (chainInfo.hideInUI) {
      throw new Error("Can't sign for hidden chain");
    }
    const isEthermintLike = KeyRingService.isEthermintLike(chainInfo);
    const evmInfo = ChainsService.getEVMInfo(chainInfo);
    const forceEVMLedger = chainInfo.features?.includes(
      "force-enable-evm-ledger"
    );

    if (!isEthermintLike && !evmInfo) {
      throw new Error("Not ethermint like and EVM chain");
    }

    const keyInfo = this.keyRingService.getKeyInfo(vaultId);
    if (!keyInfo) {
      throw new Error("Null key info");
    }

    if (keyInfo.type === "ledger" && !forceEVMLedger) {
      KeyRingCosmosService.throwErrorIfEthermintWithLedgerButNotSupported(
        chainId
      );
    }

    if (signType === EthSignType.TRANSACTION) {
      const unsignedTx = JSON.parse(Buffer.from(message).toString());
      if (unsignedTx.authorizationList) {
        throw new EthereumProviderRpcError(
          -32602,
          "Invalid params",
          "EIP-7702 transactions are not supported."
        );
      }
    }

    try {
      Bech32Address.validate(signer);
    } catch {
      // Ignore mixed-case checksum
      signer = (
        signer.substring(0, 2) === "0x" ? signer : "0x" + signer
      ).toLowerCase();
    }

    const key = await this.keyRingCosmosService.getKey(vaultId, chainId);
    if (
      signer !== key.bech32Address &&
      signer !== key.ethereumHexAddress.toLowerCase()
    ) {
      throw new Error("Signer mismatched");
    }

    return await this.interactionService.waitApproveV2(
      env,
      "/sign-ethereum",
      "request-sign-ethereum",
      {
        origin,
        chainId,
        signer,
        pubKey: key.pubKey,
        message,
        signType,
        keyType: keyInfo.type,
        keyInsensitive: keyInfo.insensitive,
      },
      async (res: { signingData: Uint8Array; signature?: Uint8Array }) => {
        const { signature, signingData } = await (async () => {
          if (keyInfo.type === "ledger" || keyInfo.type === "keystone") {
            if (!res.signature || res.signature.length === 0) {
              throw new Error("Frontend should provide signature");
            }

            return {
              signingData: res.signingData,
              signature: res.signature,
            };
          } else {
            switch (signType) {
              case EthSignType.MESSAGE: {
                const signature = await this.keyRingService.sign(
                  chainId,
                  vaultId,
                  Buffer.concat([
                    Buffer.from("\x19Ethereum Signed Message:\n"),
                    Buffer.from(res.signingData.length.toString()),
                    res.signingData,
                  ]),
                  "keccak256"
                );

                return {
                  signingData: res.signingData,
                  signature: Buffer.concat([
                    signature.r,
                    signature.s,
                    // The metamask doesn't seem to consider the chain id in this case... (maybe bug on metamask?)
                    signature.v
                      ? Buffer.from("1c", "hex")
                      : Buffer.from("1b", "hex"),
                  ]),
                };
              }
              case EthSignType.TRANSACTION: {
                const txLike: TransactionLike = JSON.parse(
                  Buffer.from(res.signingData).toString()
                );
                if (txLike.from) {
                  delete txLike.from;
                }

                const unsignedTx = Transaction.from(txLike);

                const isEIP1559 =
                  !!unsignedTx.maxFeePerGas ||
                  !!unsignedTx.maxPriorityFeePerGas;
                if (isEIP1559) {
                  unsignedTx.type = EthTransactionType.eip1559;
                }

                const signature = await this.keyRingService.sign(
                  chainId,
                  vaultId,
                  Buffer.from(
                    unsignedTx.unsignedSerialized.replace("0x", ""),
                    "hex"
                  ),
                  "keccak256"
                );

                return {
                  signingData: res.signingData,
                  signature: Buffer.concat([
                    signature.r,
                    signature.s,
                    // The metamask doesn't seem to consider the chain id in this case... (maybe bug on metamask?)
                    signature.v
                      ? Buffer.from("1c", "hex")
                      : Buffer.from("1b", "hex"),
                  ]),
                };
              }
              case EthSignType.EIP712: {
                const data = await EIP712MessageValidator.validateAsync(
                  JSON.parse(Buffer.from(res.signingData).toString())
                );
                // Since ethermint eip712 tx uses non-standard format, it cannot pass validation of ethersjs.
                // Therefore, it should be handled at a slightly lower level.
                const signature = await this.keyRingService.sign(
                  chainId,
                  vaultId,
                  Buffer.concat([
                    // eth separator
                    Buffer.from("19", "hex"),
                    // Version: 1
                    Buffer.from("01", "hex"),
                    Buffer.from(domainHash(data).replace("0x", ""), "hex"),
                    Buffer.from(messageHash(data).replace("0x", ""), "hex"),
                  ]),
                  "keccak256"
                );

                return {
                  signingData: res.signingData,
                  signature: Buffer.concat([
                    signature.r,
                    signature.s,
                    // The metamask doesn't seem to consider the chain id in this case... (maybe bug on metamask?)
                    signature.v
                      ? Buffer.from("1c", "hex")
                      : Buffer.from("1b", "hex"),
                  ]),
                };
              }

              default:
                throw new Error(`Unknown sign type: ${signType}`);
            }
          }
        })();

        try {
          const tx =
            signType === EthSignType.TRANSACTION
              ? JSON.parse(Buffer.from(signingData).toString())
              : undefined;
          const ethTxType = await (async () => {
            if (signType !== EthSignType.TRANSACTION) {
              return;
            }

            if (tx.to == null || tx.to === "0x") {
              return "deploy-contract";
            }

            const contractBytecode = await this.request<string>(
              env,
              origin,
              "eth_getCode",
              [tx.to, "latest"],
              undefined,
              chainId
            );
            if (
              (tx.data == null || tx.data === "0x") &&
              BigInt(tx.value) > 0 &&
              contractBytecode === "0x"
            ) {
              return "send-native";
            }

            if (tx.data?.startsWith("0xa9059cbb")) {
              return "execute-contract/send-erc20";
            }

            return "execute-contract";
          })();

          this.analyticsService.logEventIgnoreError("evm_tx_signed", {
            chainId,
            isInternal: env.isInternalMsg,
            origin,
            keyType: keyInfo.type,
            ethSignType: signType,
            ...(signType === EthSignType.TRANSACTION && {
              ethTxType,
            }),
            ...(ethTxType &&
              ethTxType.startsWith("execute-contract") &&
              tx && {
                contractAddress: tx.to,
              }),
          });
        } catch (e) {
          console.log(e);
        }

        return {
          signingData,
          signature,
        };
      }
    );
  }

  async signEthereumBatch(
    env: Env,
    origin: string,
    vaultId: string,
    chainId: string,
    signer: string,
    message: Uint8Array
  ): Promise<EthereumBatchSignResponse> {
    const chainInfo = this.chainsService.getChainInfoOrThrow(chainId);
    if (chainInfo.hideInUI) {
      throw new Error("Can't sign for hidden chain");
    }
    const isEthermintLike = KeyRingService.isEthermintLike(chainInfo);
    const evmInfo = ChainsService.getEVMInfo(chainInfo);
    const forceEVMLedger = chainInfo.features?.includes(
      "force-enable-evm-ledger"
    );

    if (!isEthermintLike && !evmInfo) {
      throw new Error("Not ethermint like and EVM chain");
    }

    const keyInfo = this.keyRingService.getKeyInfo(vaultId);
    if (!keyInfo) {
      throw new Error("Null key info");
    }

    if (keyInfo.type === "ledger" && !forceEVMLedger) {
      KeyRingCosmosService.throwErrorIfEthermintWithLedgerButNotSupported(
        chainId
      );
    }

    try {
      Bech32Address.validate(signer);
    } catch {
      // Ignore mixed-case checksum
      signer = (
        signer.substring(0, 2) === "0x" ? signer : "0x" + signer
      ).toLowerCase();
    }

    const key = await this.keyRingCosmosService.getKey(vaultId, chainId);
    if (
      signer !== key.bech32Address &&
      signer !== key.ethereumHexAddress.toLowerCase()
    ) {
      throw new Error("Signer mismatched");
    }

    return await this.interactionService.waitApproveV2(
      env,
      "/sign-ethereum",
      "request-sign-ethereum",
      {
        origin,
        chainId,
        signer,
        pubKey: key.pubKey,
        message,
        signType: EthSignType.EIP5792,
        keyType: keyInfo.type,
        keyInsensitive: keyInfo.insensitive,
      },
      async (res: { signingData: Uint8Array; signature?: Uint8Array }) => {
        const batchSigningResponse = await (async () => {
          if (keyInfo.type === "ledger" || keyInfo.type === "keystone") {
            throw new Error("Ledger and Keystone are not supported atm");
          } else {
            const signingData: BatchSigningData = JSON.parse(
              Buffer.from(res.signingData).toString()
            );

            switch (signingData.strategy) {
              case "single":
              case "atomic": {
                const unsignedTxLike = signingData.unsignedTxs[0];
                const unsignedTx = Transaction.from(
                  unsignedTxLike as TransactionLike
                );

                if (signingData.strategy === "atomic") {
                  // Check if authorizationList is not null
                  if (
                    unsignedTxLike.authorizationList &&
                    unsignedTxLike.authorizationList.length > 0
                  ) {
                    const authorization = unsignedTxLike.authorizationList[0];

                    const nonce =
                      typeof authorization.nonce === "string"
                        ? BigInt(authorization.nonce)
                        : authorization.nonce;

                    const hash = hashAuthorization({
                      address: authorization.address,
                      nonce,
                      chainId: unsignedTx.chainId,
                    });

                    // sign hash of authorization, no digest method
                    const signature = await this.keyRingService.sign(
                      chainId,
                      vaultId,
                      Buffer.from(hash.replace("0x", ""), "hex"),
                      "noop"
                    );

                    // add signature to authorization list
                    unsignedTx.authorizationList = [
                      {
                        address: authorization.address,
                        nonce,
                        chainId: unsignedTx.chainId,
                        signature:
                          "0x" +
                          Buffer.concat([
                            signature.r,
                            signature.s,
                            signature.v
                              ? Buffer.from("1c", "hex")
                              : Buffer.from("1b", "hex"),
                          ]).toString("hex"),
                      },
                    ];
                  }
                }

                const signature = await this.keyRingService.sign(
                  chainId,
                  vaultId,
                  Buffer.from(
                    unsignedTx.unsignedSerialized.replace("0x", ""),
                    "hex"
                  ),
                  "keccak256"
                );

                unsignedTx.signature =
                  "0x" +
                  Buffer.concat([
                    signature.r,
                    signature.s,
                    signature.v
                      ? Buffer.from("1c", "hex")
                      : Buffer.from("1b", "hex"),
                  ]).toString("hex");

                const batchSigningResponse: EthereumBatchSignResponse = {
                  strategy: signingData.strategy,
                  batchId: signingData.batchId,
                  signedTxs: [unsignedTx.serialized],
                };

                return batchSigningResponse;
              }
              // case "sequential": {
              //   // TODO: 여러 트랜잭션 처리
              //   break;
              // }
              default: {
                throw new Error(
                  `Unknown or not supported strategy: ${signingData.strategy}`
                );
              }
            }
          }
        })();

        try {
          this.analyticsService.logEventIgnoreError("evm_batch_tx_signed", {
            chainId,
            isInternal: env.isInternalMsg,
            origin,
            keyType: keyInfo.type,
            ethSignType: EthSignType.EIP5792,
          });
        } catch (e) {
          console.log(e);
        }

        return batchSigningResponse;
      }
    );
  }

  async request<T = any>(
    env: Env,
    origin: string,
    method: string,
    params?: unknown[] | Record<string, unknown>,
    providerId?: string,
    chainId?: string
  ): Promise<T> {
    if (env.isInternalMsg && chainId == null) {
      throw new Error(
        "The chain id must be provided for the internal message."
      );
    }

    const result = (await (async () => {
      switch (method) {
        case "keplr_initProviderState": {
          const currentChainId = this.getCurrentChainId(origin, chainId);
          if (currentChainId == null) {
            return {
              currentEvmChainId: null,
              currentChainId: null,
              selectedAddress: null,
            } as T;
          }

          try {
            const pubkey = await this.keyRingService.getPubKeySelected(
              currentChainId
            );
            const selectedAddress = `0x${Buffer.from(
              pubkey.getEthAddress()
            ).toString("hex")}`;

            return {
              currentEvmChainId: this.getEVMChainId(currentChainId),
              currentChainId: currentChainId,
              selectedAddress,
            };
          } catch (e) {
            console.error(e);
            return null;
          }
        }
        case "keplr_connect": {
          try {
            const currentChainId = this.forceGetCurrentChainId(origin, chainId);
            const pubkey = await this.keyRingService.getPubKeySelected(
              currentChainId
            );
            const selectedAddress = `0x${Buffer.from(
              pubkey.getEthAddress()
            ).toString("hex")}`;

            return {
              currentEvmChainId: this.getEVMChainId(currentChainId),
              currentChainId: currentChainId,
              selectedAddress,
            };
          } catch (e) {
            console.error(e);
            return null;
          }
        }
        case "keplr_disconnect": {
          return this.permissionService.removeAllTypePermission([origin]);
        }
        case "eth_chainId": {
          const currentChainId = this.forceGetCurrentChainId(origin, chainId);
          return `0x${this.getEVMChainId(currentChainId).toString(16)}`;
        }
        case "net_version": {
          const currentChainId = this.forceGetCurrentChainId(origin, chainId);
          return this.getEVMChainId(currentChainId).toString();
        }
        case "eth_accounts": {
          const currentChainId = this.getCurrentChainId(origin, chainId);
          if (currentChainId == null) {
            return [] as T;
          }

          const pubkey = await this.keyRingService.getPubKeySelected(
            currentChainId
          );
          const selectedAddress = `0x${Buffer.from(
            pubkey.getEthAddress()
          ).toString("hex")}`;

          return [selectedAddress];
        }
        case "eth_requestAccounts": {
          const currentChainId = this.forceGetCurrentChainId(origin, chainId);
          const pubkey = await this.keyRingService.getPubKeySelected(
            currentChainId
          );
          const selectedAddress = `0x${Buffer.from(
            pubkey.getEthAddress()
          ).toString("hex")}`;

          return [selectedAddress];
        }
        case "eth_sendTransaction": {
          const txLike =
            (Array.isArray(params) && (params?.[0] as TransactionLike)) || null;
          if (!txLike) {
            throw new EthereumProviderRpcError(
              -32602,
              "Invalid params",
              "Must provide a transaction."
            );
          }

          const currentChainId = this.forceGetCurrentChainId(origin, chainId);

          const { from: sender, authorizationList } = txLike;

          if (authorizationList) {
            throw new EthereumProviderRpcError(
              -32602,
              "Invalid params",
              "EIP-7702 transactions are not supported."
            );
          }

          if (txLike.chainId) {
            const evmChainIdFromTx: number = validateEVMChainId(
              (() => {
                if (typeof txLike.chainId === "string") {
                  if (txLike.chainId.startsWith("0x")) {
                    return parseInt(txLike.chainId, 16);
                  } else {
                    return parseInt(txLike.chainId, 10);
                  }
                } else if (typeof txLike.chainId === "bigint") {
                  return Number(txLike.chainId);
                } else {
                  return txLike.chainId;
                }
              })()
            );
            if (evmChainIdFromTx !== this.getEVMChainId(currentChainId)) {
              throw new Error(
                "The current active chain id does not match the one in the transaction."
              );
            }
          }

          const pubkey = await this.keyRingService.getPubKeySelected(
            currentChainId
          );
          const selectedAddress = `0x${Buffer.from(
            pubkey.getEthAddress()
          ).toString("hex")}`;

          const transactionCount = await this.request(
            env,
            origin,
            "eth_getTransactionCount",
            [selectedAddress, "pending"],
            providerId,
            chainId
          );

          // ethersjs tries to recover 'from' address from signature, thus we need to remove it from the transaction
          if (txLike.from) {
            delete txLike.from;
          }

          const unsignedTx = Transaction.from(txLike);
          unsignedTx.chainId = this.getEVMChainId(currentChainId);
          unsignedTx.nonce = parseInt(transactionCount, 16);

          try {
            const { signingData, signature } = await this.signEthereumSelected(
              env,
              origin,
              currentChainId,
              sender ?? "",
              Buffer.from(JSON.stringify(unsignedTx.toJSON())),
              EthSignType.TRANSACTION
            );

            const txLike: TransactionLike = JSON.parse(
              Buffer.from(signingData).toString()
            );
            if (txLike.from) {
              delete txLike.from;
            }

            const signingTx = Transaction.from(txLike);

            const isEIP1559 =
              !!signingTx.maxFeePerGas || !!signingTx.maxPriorityFeePerGas;
            if (isEIP1559) {
              signingTx.type = EthTransactionType.eip1559;
            }

            signingTx.signature = "0x" + Buffer.from(signature).toString("hex");

            const signedTx = Buffer.from(
              signingTx.serialized.replace("0x", ""),
              "hex"
            );

            const txHash =
              await this.backgroundTxEthereumService.sendEthereumTx(
                origin,
                currentChainId,
                signedTx,
                {}
              );

            return txHash;
          } catch (e) {
            if (
              (e instanceof Error && e.message === "Request rejected") ||
              e === "Request rejected"
            ) {
              throw new EthereumProviderRpcError(4001, "User Rejected Request");
            }
            throw e;
          }
        }
        case "eth_signTransaction": {
          const txLike =
            (Array.isArray(params) && (params?.[0] as TransactionLike)) || null;
          if (!txLike) {
            throw new EthereumProviderRpcError(
              -32602,
              "Invalid params",
              "Must provide a transaction."
            );
          }

          const currentChainId = this.forceGetCurrentChainId(origin, chainId);

          const { from: sender, authorizationList, ...restTx } = txLike;

          if (authorizationList) {
            throw new Error("EIP-7702 transactions are not supported.");
          }

          if (txLike.chainId) {
            const evmChainIdFromTx: number = validateEVMChainId(
              (() => {
                if (typeof txLike.chainId === "string") {
                  if (txLike.chainId.startsWith("0x")) {
                    return parseInt(txLike.chainId, 16);
                  } else {
                    return parseInt(txLike.chainId, 10);
                  }
                } else if (typeof txLike.chainId === "bigint") {
                  return Number(txLike.chainId);
                } else {
                  return txLike.chainId;
                }
              })()
            );
            if (evmChainIdFromTx !== this.getEVMChainId(currentChainId)) {
              throw new Error(
                "The current active chain id does not match the one in the transaction."
              );
            }
          }

          const pubkey = await this.keyRingService.getPubKeySelected(
            currentChainId
          );
          const selectedAddress = `0x${Buffer.from(
            pubkey.getEthAddress()
          ).toString("hex")}`;

          const transactionCount = await this.request(
            env,
            origin,
            "eth_getTransactionCount",
            [selectedAddress, "pending"],
            providerId,
            chainId
          );

          const unsignedTx = new Transaction();
          unsignedTx.chainId = this.getEVMChainId(currentChainId);
          unsignedTx.nonce = parseInt(transactionCount, 16);
          unsignedTx.gasLimit = hexValue(restTx?.gasLimit ?? "0");

          try {
            const { signingData, signature } = await this.signEthereumSelected(
              env,
              origin,
              currentChainId,
              sender ?? "",
              Buffer.from(JSON.stringify(unsignedTx.toJSON())),
              EthSignType.TRANSACTION
            );

            const txLike: TransactionLike = JSON.parse(
              Buffer.from(signingData).toString()
            );
            if (txLike.from) {
              delete txLike.from;
            }

            const signingTx = Transaction.from(txLike);

            const isEIP1559 =
              !!signingTx.maxFeePerGas || !!signingTx.maxPriorityFeePerGas;
            if (isEIP1559) {
              signingTx.type = EthTransactionType.eip1559;
            }

            signingTx.signature = "0x" + Buffer.from(signature).toString("hex");

            const signedTx = signingTx.serialized;

            return signedTx;
          } catch (e) {
            if (
              (e instanceof Error && e.message === "Request rejected") ||
              e === "Request rejected"
            ) {
              throw new EthereumProviderRpcError(4001, "User Rejected Request");
            }
            throw e;
          }
        }
        case "personal_sign": {
          const message =
            (Array.isArray(params) && (params?.[0] as string)) || undefined;
          if (!message) {
            throw new EthereumProviderRpcError(
              -32602,
              "Invalid params",
              "Must provide a stringified message."
            );
          }

          const signer =
            (Array.isArray(params) && (params?.[1] as string)) || undefined;
          if (!signer || (signer && !signer.match(/^0x[0-9A-Fa-f]*$/))) {
            throw new EthereumProviderRpcError(
              -32602,
              "Invalid params",
              "Must provide an Ethereum address."
            );
          }

          const currentChainId = this.forceGetCurrentChainId(origin, chainId);
          try {
            const { signature } = await this.signEthereumSelected(
              env,
              origin,
              currentChainId,
              signer,
              message.startsWith("0x")
                ? Buffer.from(message.slice(2), "hex")
                : Buffer.from(message, "utf8"),
              EthSignType.MESSAGE
            );

            return `0x${Buffer.from(signature).toString("hex")}`;
          } catch (e) {
            if (
              (e instanceof Error && e.message === "Request rejected") ||
              e === "Request rejected"
            ) {
              throw new EthereumProviderRpcError(4001, "User Rejected Request");
            }
            throw e;
          }
        }
        case "eth_signTypedData_v3":
        case "eth_signTypedData_v4": {
          const signer =
            (Array.isArray(params) && (params?.[0] as string)) || undefined;
          if (!signer || (signer && !signer.match(/^0x[0-9A-Fa-f]*$/))) {
            throw new EthereumProviderRpcError(
              -32602,
              "Invalid params",
              "Must provide an Ethereum address."
            );
          }

          const typedData =
            (Array.isArray(params) && (params?.[1] as any)) || undefined;

          const currentChainId = this.forceGetCurrentChainId(origin, chainId);
          try {
            const { signature } = await this.signEthereumSelected(
              env,
              origin,
              currentChainId,
              signer,
              Buffer.from(
                typeof typedData === "string"
                  ? typedData
                  : JSON.stringify(typedData)
              ),
              EthSignType.EIP712
            );

            return `0x${Buffer.from(signature).toString("hex")}`;
          } catch (e) {
            if (
              (e instanceof Error && e.message === "Request rejected") ||
              e === "Request rejected"
            ) {
              throw new EthereumProviderRpcError(4001, "User Rejected Request");
            }
            throw e;
          }
        }
        case "eth_subscribe": {
          const currentChainId = this.forceGetCurrentChainId(origin, chainId);
          const currentChainEVMInfo =
            this.chainsService.getEVMInfoOrThrow(currentChainId);
          if (!currentChainEVMInfo.websocket) {
            throw new Error(
              `WebSocket endpoint for current chain has not been provided to Keplr.`
            );
          }

          const ws = new WebSocket(currentChainEVMInfo.websocket);
          const subscriptionId: string = await new Promise(
            (resolve, reject) => {
              const handleOpen = () => {
                ws.send(
                  JSON.stringify({
                    jsonrpc: "2.0",
                    id: 1,
                    method,
                    params,
                  })
                );
              };
              const handleMessage = (event: MessageEvent) => {
                const eventData = JSON.parse(event.data);
                if (eventData.error) {
                  ws.close();

                  reject(eventData.error);
                } else {
                  if (eventData.method === "eth_subscription") {
                    this.interactionService.dispatchEvent(
                      WEBPAGE_PORT,
                      "keplr_ethSubscription",
                      {
                        origin,
                        providerId,
                        data: {
                          subscription: eventData.params.subscription,
                          result: eventData.params.result,
                        },
                      }
                    );
                  } else {
                    resolve(eventData.result);
                  }
                }
              };
              const handleError = () => {
                ws.close();

                reject(
                  new Error(
                    "Something went wrong with the WebSocket connection"
                  )
                );
              };

              ws.addEventListener("open", handleOpen);
              ws.addEventListener("message", handleMessage);
              ws.addEventListener("error", handleError);
              ws.addEventListener(
                "close",
                () => {
                  ws.removeEventListener("open", handleOpen);
                  ws.removeEventListener("message", handleMessage);
                  ws.removeEventListener("error", handleError);
                },
                { once: true }
              );
            }
          );
          runInAction(() => {
            const key = `${subscriptionId}/${providerId}`;
            this.websocketSubscriptionMap.set(key, ws);
          });

          return subscriptionId;
        }
        case "eth_unsubscribe": {
          const subscriptionId =
            (Array.isArray(params) && (params?.[0] as string)) || undefined;
          if (!subscriptionId) {
            throw new EthereumProviderRpcError(
              -32602,
              "Invalid params",
              "Must provide a subscription id."
            );
          }

          const currentChainId = this.forceGetCurrentChainId(origin, chainId);
          const currentChainEVMInfo =
            this.chainsService.getEVMInfoOrThrow(currentChainId);
          if (!currentChainEVMInfo.websocket) {
            throw new Error(
              `WebSocket endpoint for current chain has not been provided to Keplr.`
            );
          }

          const subscribedWs =
            this.websocketSubscriptionMap.get(subscriptionId);
          if (!subscribedWs) {
            return false;
          }

          const ws = new WebSocket(currentChainEVMInfo.websocket);
          const result = await new Promise((resolve, reject) => {
            const handleOpen = () => {
              ws.send(
                JSON.stringify({
                  jsonrpc: "2.0",
                  id: 1,
                  method,
                  params,
                })
              );
            };
            const handleMessage = (event: MessageEvent) => {
              ws.close();

              const eventData = JSON.parse(event.data);
              if (eventData.error) {
                reject(eventData.error);
              } else {
                subscribedWs.close();
                runInAction(() => {
                  const key = `${subscriptionId}/${providerId}`;
                  this.websocketSubscriptionMap.delete(key);
                });
                resolve(eventData.result);
              }
            };
            const handleError = () => {
              ws.close();

              reject(
                new Error("Something went wrong with the WebSocket connection")
              );
            };

            ws.addEventListener("open", handleOpen);
            ws.addEventListener("message", handleMessage);
            ws.addEventListener("error", handleError);
            ws.addEventListener(
              "close",
              () => {
                ws.removeEventListener("open", handleOpen);
                ws.removeEventListener("message", handleMessage);
                ws.removeEventListener("error", handleError);
              },
              { once: true }
            );
          });

          return result;
        }
        case "wallet_switchEthereumChain": {
          const newCurrentChainId = this.getNewCurrentChainIdFromRequest(
            method,
            params
          );
          const currentChainId = this.getCurrentChainId(origin, chainId);
          if (
            // If the new current chain id is not set or the current chain id is the same as the new current chain id, do nothing.
            newCurrentChainId == null ||
            currentChainId === newCurrentChainId
          ) {
            return null;
          }

          try {
            await this.permissionService.updateCurrentChainIdForEVM(
              env,
              origin,
              newCurrentChainId
            );
          } catch (e) {
            if (
              (e instanceof Error && e.message === "Request rejected") ||
              e === "Request rejected"
            ) {
              throw new EthereumProviderRpcError(4001, "User Rejected Request");
            }
            throw e;
          }

          return null;
        }
        case "wallet_addEthereumChain": {
          const param =
            Array.isArray(params) &&
            (params?.[0] as {
              chainId: string;
              chainName: string;
              nativeCurrency: {
                name: string;
                symbol: string;
                decimals: number;
              };
              rpcUrls: string[];
              iconUrls?: string[];
            });
          if (!param || typeof param !== "object") {
            throw new EthereumProviderRpcError(
              -32602,
              "Invalid params",
              "Must provide a single object parameter."
            );
          }

          const evmChainId = validateEVMChainId(parseInt(param.chainId, 16));

          const chainInfo =
            this.chainsService.getChainInfoByEVMChainId(evmChainId) ??
            (await (async () => {
              const rpc = param.rpcUrls.find((url) => {
                try {
                  const urlObject = new URL(url);
                  return (
                    urlObject.protocol === "http:" ||
                    urlObject.protocol === "https:"
                  );
                } catch {
                  return false;
                }
              });
              const websocket = param.rpcUrls.find((url) => {
                try {
                  const urlObject = new URL(url);
                  return (
                    urlObject.protocol === "ws:" ||
                    urlObject.protocol === "wss:"
                  );
                } catch {
                  return false;
                }
              });
              // Skip the validation for these parameters because they will be validated in the `suggestChainInfo` method.
              const { chainName, nativeCurrency, iconUrls } = param;

              const addingChainInfo = {
                rpc,
                rest: rpc,
                chainId: `eip155:${evmChainId}`,
                bip44: {
                  coinType: 60,
                },
                chainName,
                stakeCurrency: {
                  coinDenom: nativeCurrency.symbol,
                  coinMinimalDenom: nativeCurrency.symbol,
                  coinDecimals: nativeCurrency.decimals,
                },
                currencies: [
                  {
                    coinDenom: nativeCurrency.symbol,
                    coinMinimalDenom: nativeCurrency.symbol,
                    coinDecimals: nativeCurrency.decimals,
                  },
                ],
                feeCurrencies: [
                  {
                    coinDenom: nativeCurrency.symbol,
                    coinMinimalDenom: nativeCurrency.symbol,
                    coinDecimals: nativeCurrency.decimals,
                  },
                ],
                evm: {
                  chainId: evmChainId,
                  rpc,
                  websocket,
                },
                features: ["eth-address-gen", "eth-key-sign"],
                chainSymbolImageUrl: iconUrls?.[0],
                beta: true,
              } as ChainInfo;

              try {
                await this.chainsService.suggestChainInfo(
                  env,
                  addingChainInfo,
                  origin
                );
              } catch (e) {
                if (
                  (e instanceof Error && e.message === "Request rejected") ||
                  e === "Request rejected"
                ) {
                  throw new EthereumProviderRpcError(
                    4001,
                    "User Rejected Request"
                  );
                }
                throw e;
              }

              return addingChainInfo;
            })());

          this.permissionService.addPermission(
            [chainInfo.chainId],
            getBasicAccessPermissionType(),
            [origin]
          );

          try {
            await this.permissionService.updateCurrentChainIdForEVM(
              env,
              origin,
              chainInfo.chainId
            );
          } catch (e) {
            if (
              (e instanceof Error && e.message === "Request rejected") ||
              e === "Request rejected"
            ) {
              throw new EthereumProviderRpcError(4001, "User Rejected Request");
            }
            throw e;
          }

          return null;
        }
        case "wallet_getPermissions":
        // This `request` method can be executed if the basic access permission is granted.
        // So, it's not necessary to check or grant the permission here.
        case "wallet_requestPermissions": {
          return [{ parentCapability: "eth_accounts" }];
        }
        case "wallet_revokePermissions": {
          const param =
            Array.isArray(params) && (params?.[0] as Record<string, object>);
          if (!param || typeof param !== "object") {
            throw new EthereumProviderRpcError(
              -32602,
              "Invalid params",
              "Must provide a single object parameter."
            );
          }

          if (param["eth_accounts"] == null) {
            throw new EthereumProviderRpcError(
              -32602,
              "Invalid params",
              "Must provide a single object parameter with the key 'eth_accounts'."
            );
          }

          await this.permissionService.removeAllTypePermission([origin]);

          return null;
        }
        case "wallet_watchAsset": {
          const param = params as
            | {
                type: string;
                options: {
                  address: string;
                  symbol?: string;
                  decimals?: number;
                  image?: string;
                  tokenId?: string;
                };
              }
            | undefined;
          if (!param) {
            throw new EthereumProviderRpcError(
              -32602,
              "Invalid params",
              "Must provide a single object parameter."
            );
          }

          if (param.type !== "ERC20") {
            throw new EthereumProviderRpcError(
              -32602,
              "Invalid params",
              "Must provide a valid asset type. Only ERC20 is supported."
            );
          }

          const contractAddress = param?.options.address;

          const currentChainId = this.forceGetCurrentChainId(origin, chainId);

          try {
            await this.tokenERC20Service.suggestERC20Token(
              env,
              currentChainId,
              contractAddress
            );
          } catch (e) {
            if (
              (e instanceof Error && e.message === "Request rejected") ||
              e === "Request rejected"
            ) {
              throw new EthereumProviderRpcError(4001, "User Rejected Request");
            }
            throw e;
          }

          return true;
        }
        case "eth_call":
        case "eth_estimateGas":
        case "eth_getTransactionCount":
        case "eth_getTransactionByHash":
        case "eth_getTransactionByBlockHashAndIndex":
        case "eth_getTransactionByBlockNumberAndIndex":
        case "eth_getTransactionByHash":
        case "eth_getTransactionReceipt":
        case "eth_sendRawTransaction":
        case "eth_protocolVersion":
        case "eth_syncing":
        case "eth_getCode":
        case "eth_getLogs":
        case "eth_getProof":
        case "eth_getStorageAt":
        case "eth_getBalance":
        case "eth_blockNumber":
        case "eth_getBlockByHash":
        case "eth_getBlockByNumber":
        case "eth_gasPrice":
        case "eth_feeHistory":
        case "eth_maxPriorityFeePerGas": {
          const currentChainId = this.forceGetCurrentChainId(origin, chainId);
          const currentChainEVMInfo =
            this.chainsService.getEVMInfoOrThrow(currentChainId);

          return (
            await simpleFetch<{
              jsonrpc: string;
              id: number;
              result: any;
              error?: Error;
            }>(currentChainEVMInfo.rpc, {
              method: "POST",
              headers: {
                "content-type": "application/json",
                "request-source": origin,
              },
              body: JSON.stringify({
                jsonrpc: "2.0",
                method,
                params,
                id: 1,
              }),
            })
          ).data.result;
        }
        // EIP-5792 Implementations
        case "wallet_getCapabilities":
          // parameter는 [account, [chainId]] 이거나 null
          const isArray = Array.isArray(params);
          let accountToCheck = isArray ? (params?.[0] as string) : undefined;
          let chainIdsToCheck = isArray ? (params?.[1] as string[]) : undefined;

          if (!chainIdsToCheck || chainIdsToCheck.length === 0) {
            const currentChainId = this.forceGetCurrentChainId(origin, chainId);
            chainIdsToCheck = [hexValue(this.getEVMChainId(currentChainId))];
          }

          const chainIdToCheck = chainIdsToCheck[0];

          if (!accountToCheck) {
            const pubKey = await this.keyRingService.getPubKeySelected(
              `eip155:${parseInt(chainIdToCheck, 16)}`
            );
            const bech32Address = new Bech32Address(pubKey.getEthAddress());

            accountToCheck = bech32Address.toHex(true);
          } else {
            if (!isAddress(accountToCheck)) {
              throw new EthereumProviderRpcError(
                -32602,
                "Invalid params",
                `Invalid Ethereum address format: ${accountToCheck}`
              );
            }
          }

          return await this.getAccountCapabilities(
            chainIdToCheck,
            accountToCheck
          );
        case "wallet_sendCalls":
          const param =
            (Array.isArray(params) && (params[0] as WalletSendCallsRequest)) ||
            undefined;

          // check if the chain is supported
          const currentChainId = this.forceGetCurrentChainId(origin, chainId);
          const hexChainId = hexValue(this.getEVMChainId(currentChainId));

          // 이거 이렇게 비교해도 되나
          if (param?.chainId && param?.chainId !== hexChainId) {
            throw new EthereumProviderRpcError(
              4902,
              `Unmatched chain ID: ${param?.chainId}`
            );
          }

          // validate calls
          if (!param?.calls || param?.calls.length === 0) {
            throw new EthereumProviderRpcError(
              -32602,
              "Invalid params",
              "Must provide at least one call."
            );
          }

          for (const call of param?.calls) {
            // Check if this is a contract deployment transaction
            const isContractDeployment =
              !call.to ||
              call.to === "" ||
              call.to === "0x" ||
              call.to === "0x0000000000000000000000000000000000000000" ||
              call.to.toLowerCase() ===
                "0x0000000000000000000000000000000000000000";

            if (isContractDeployment) {
              // For contract deployment, data field must contain bytecode
              if (!call.data || call.data === "0x" || call.data.length <= 2) {
                throw new EthereumProviderRpcError(
                  -32602,
                  "Invalid params",
                  "Contract deployment requires valid bytecode in data field."
                );
              }
            } else {
              // For regular transactions, validate the 'to' address format
              if (!call.to || !isAddress(call.to)) {
                throw new EthereumProviderRpcError(
                  -32602,
                  "Invalid params",
                  `Invalid 'to' address format: ${call.to || "undefined"}`
                );
              }
            }

            // Validate value field format if provided
            if (call.value !== undefined) {
              if (
                typeof call.value !== "string" ||
                !call.value.match(/^0x[0-9a-fA-F]*$/)
              ) {
                throw new EthereumProviderRpcError(
                  -32602,
                  "Invalid params",
                  "Invalid 'value' format. Must be hex string."
                );
              }
            }

            // Validate data field format if provided
            if (call.data !== undefined) {
              if (
                typeof call.data !== "string" ||
                !call.data.match(/^0x[0-9a-fA-F]*$/)
              ) {
                throw new EthereumProviderRpcError(
                  -32602,
                  "Invalid params",
                  "Invalid 'data' format. Must be hex string."
                );
              }
            }
          }

          // check if the from address is selected key
          const pubKey = await this.keyRingService.getPubKeySelected(
            currentChainId
          );
          const bech32Address = new Bech32Address(pubKey.getEthAddress());
          const fromAddress = bech32Address.toHex(true);

          if (param?.from) {
            // Validate from address format first
            if (!isAddress(param.from)) {
              throw new EthereumProviderRpcError(
                -32602,
                "Invalid params",
                `Invalid 'from' address format: ${param.from}`
              );
            }

            // Then check if it matches the selected account
            if (param.from.toLowerCase() !== fromAddress.toLowerCase()) {
              throw new EthereumProviderRpcError(
                4902,
                `Unmatched from address: ${param.from}`
              );
            }
          }

          if (!param?.calls || param?.calls.length === 0) {
            throw new EthereumProviderRpcError(
              -32602,
              "Invalid params",
              "Must provide at least one call."
            );
          }

          const capabilities = await this.getAccountCapabilities(
            hexChainId,
            fromAddress
          );

          // check if atomicRequired but not supported
          if (param?.atomicRequired) {
            const atomicStatus = capabilities[hexChainId].atomic.status;

            if (atomicStatus === "unsupported") {
              throw new EthereumProviderRpcError(
                4902,
                `Atomic is not supported on this chain.`
              );
            }
          }

          const transactionCount = await this.request(
            env,
            origin,
            "eth_getTransactionCount",
            [fromAddress, "pending"],
            providerId,
            chainId
          );

          const chainCapabilities = capabilities[hexChainId];

          const request: InternalSendCallsRequest = {
            batchId: generateRequestId(new Date().getTime().toString()),
            calls: param?.calls.map((call) => {
              return {
                ...call,
                data: call.data || "0x",
              };
            }),
            nonce: parseInt(transactionCount, 16),
            apiVersion: param?.version || "1.0.0",
            chainCapabilities,
          };

          const batchResponse = await this.signEthereumSelected(
            env,
            origin,
            currentChainId,
            fromAddress,
            Buffer.from(JSON.stringify(request)),
            EthSignType.EIP5792
          );

          const signedTxs = batchResponse.signedTxs;
          if (signedTxs.length < 1) {
            throw new EthereumProviderRpcError(
              -32602,
              "Invalid signing data",
              "Invalid signing data"
            );
          }

          // Create batch history first with pending transactions
          const strategy = (
            batchResponse.strategy === "unavailable"
              ? "single"
              : batchResponse.strategy
          ) as "atomic" | "sequential" | "single";

          this.recentSendHistoryService.addRecentBatchHistory({
            batchId: request.batchId,
            chainId: currentChainId,
            strategy,
            signedTxs,
          });

          // Return ID immediately and process transactions in background
          const batchId = request.batchId;

          // Process transactions asynchronously in the background
          // Using Promise microtask to avoid blocking the response
          Promise.resolve().then(async () => {
            await runInAction(async () => {
              try {
                await this.recentSendHistoryService.processBatchByStrategy(
                  batchId,
                  async (signedTx: string) => {
                    return await this.backgroundTxEthereumService.sendEthereumTx(
                      origin,
                      currentChainId,
                      Buffer.from(signedTx.replace("0x", ""), "hex"),
                      {
                        // silent: true
                      }
                    );
                  }
                );
              } catch (error) {
                console.error(`Batch processing failed for ${batchId}:`, error);
                // The error handling will be done in processBatchByStrategy
                // which updates the observable state accordingly
              }
            });
          });

          return {
            id: batchId,
          } as WalletSendCallsResponse;
        case "wallet_getCallsStatus":
          const id =
            (Array.isArray(params) && (params[0] as string)) || undefined;

          if (!id) {
            throw new EthereumProviderRpcError(
              -32602,
              "Invalid params",
              "Must provide an id."
            );
          }

          // 히스토리에 저장된 id를 찾아서 상태 계산
          const batchHistory =
            this.recentSendHistoryService.getRecentBatchHistory(id);
          if (!batchHistory) {
            throw new EthereumProviderRpcError(4200, `History not found`);
          }

          const statusChainId = this.forceGetCurrentChainId(
            origin,
            batchHistory.chainId
          );
          const statusChainEVMInfo =
            this.chainsService.getEVMInfoOrThrow(statusChainId);

          const evmChainId = this.getEVMChainId(statusChainId);

          // Calculate batch status and receipts
          const confirmedTxs = batchHistory.transactions.filter(
            (tx) => tx.status === "BATCH_TX_CONFIRMED"
          );
          const failedTxs = batchHistory.transactions.filter(
            (tx) => tx.status === "BATCH_TX_FAILED"
          );

          // Determine if strategy is atomic
          const atomic = batchHistory.strategy === "atomic";

          // Build receipts array - only include completed transactions
          const receipts: TransactionReceipt[] = [];

          for (const tx of batchHistory.transactions) {
            if (
              tx.txHash &&
              (tx.status === "BATCH_TX_CONFIRMED" ||
                tx.status === "BATCH_TX_FAILED")
            ) {
              try {
                const receipt = (
                  await simpleFetch<{
                    jsonrpc: string;
                    id: number;
                    result: any;
                    error?: Error;
                  }>(statusChainEVMInfo.rpc, {
                    method: "POST",
                    headers: {
                      "content-type": "application/json",
                      "request-source": origin,
                    },
                    body: JSON.stringify({
                      jsonrpc: "2.0",
                      method: "eth_getTransactionReceipt",
                      params: [tx.txHash],
                      id: 1,
                    }),
                  })
                ).data.result;

                // Only add non-null receipts
                if (receipt) {
                  receipts.push(receipt);
                }
              } catch (error) {
                console.warn(
                  `Failed to fetch receipt for ${tx.txHash}:`,
                  error
                );
                // Skip this receipt if there's an error
              }
            }
          }

          // Calculate status based on batch state and transaction results
          let status: WalletGetCallStatusResponseStatus;

          switch (batchHistory.status) {
            case "BATCH_PENDING":
            case "BATCH_IN_PROGRESS":
              status = 100; // Pending
              break;

            case "BATCH_COMPLETED":
              if (failedTxs.length === 0) {
                status = 200; // Confirmed - all transactions succeeded
              } else if (confirmedTxs.length === 0) {
                status = 500; // ChainRulesFailed - all transactions failed onchain
              } else {
                status = 600; // PartialChainRulesFailed - some succeeded, some failed
              }
              break;

            case "BATCH_FAILED":
              // Check if any transactions made it onchain
              if (confirmedTxs.length > 0 || failedTxs.length > 0) {
                if (confirmedTxs.length === 0) {
                  status = 500; // ChainRulesFailed - failed onchain
                } else {
                  status = 600; // PartialChainRulesFailed - partial failure
                }
              } else {
                status = 400; // OffchainFailed - failed before reaching chain
              }
              break;

            default:
              status = 100; // Default to pending
          }

          return {
            version: "1.0.0",
            chainId: `0x${evmChainId.toString(16)}`,
            id,
            status,
            atomic,
            receipts,
          } as WalletGetCallStatusResponse;
        case "wallet_showCallsStatus":
          const showId =
            (Array.isArray(params) && (params[0] as string)) || undefined;

          if (!showId) {
            throw new EthereumProviderRpcError(
              -32602,
              "Invalid params",
              "Must provide an id."
            );
          }
          // TODO: 히스토리에 저장된 id를 찾아서 receipt 조회
          const batchShowHistory =
            this.recentSendHistoryService.getRecentBatchHistory(showId);
          if (!batchShowHistory) {
            throw new EthereumProviderRpcError(4200, `History not found`);
          }

          // NOTE: 상태를 화면에 보여줘야 돼서 우선 skip

          throw new EthereumProviderRpcError(4200, `Not implemented`);
        default: {
          throw new EthereumProviderRpcError(4200, `Unsupported Method`);
        }
      }
    })()) as T;

    return result;
  }

  getNewCurrentChainIdFromRequest(
    method: string,
    params?: unknown[] | Record<string, unknown>
  ): string | undefined {
    switch (method) {
      case "wallet_switchEthereumChain": {
        const param =
          (Array.isArray(params) && (params?.[0] as { chainId: string })) ||
          undefined;
        if (!param?.chainId) {
          throw new EthereumProviderRpcError(
            -32602,
            "Invalid params",
            "Must provide a chain id."
          );
        }

        const newEvmChainId = validateEVMChainId(parseInt(param.chainId, 16));
        const chainInfo =
          this.chainsService.getChainInfoByEVMChainId(newEvmChainId);
        if (!chainInfo) {
          throw new EthereumProviderRpcError(
            4902,
            `Unrecognized chain ID "${newEvmChainId}". Try adding the chain using wallet_addEthereumChain first.`
          );
        }

        return chainInfo.chainId;
      }
      default: {
        return;
      }
    }
  }

  checkNeedEnableAccess(method: string) {
    if (enableAccessSkippedEVMJSONRPCMethods.includes(method)) {
      return false;
    }

    return true;
  }

  private getCurrentChainId(origin: string, chainId?: string) {
    return chainId || this.permissionService.getCurrentChainIdForEVM(origin);
  }

  private forceGetCurrentChainId(origin: string, chainId?: string) {
    return (
      this.getCurrentChainId(origin, chainId) ||
      // If the current chain id is not set, use Ethereum mainnet as the default chain id.
      "eip155:1"
    );
  }

  private getEVMChainId(chainId: string) {
    const evmInfo = this.chainsService.getEVMInfoOrThrow(chainId);

    return evmInfo.chainId;
  }

  private async getAccountCapabilities(
    hexChainId: string,
    address?: string
  ): Promise<Capabilities> {
    if (!address) {
      const pubKey = await this.keyRingService.getPubKeySelected(hexChainId);
      const bech32Address = new Bech32Address(pubKey.getEthAddress());
      address = bech32Address.toHex(true);
    }

    const chainId = `eip155:${validateEVMChainId(parseInt(hexChainId, 16))}`;

    const currentChainEVMInfo = this.chainsService.getEVMInfoOrThrow(chainId);

    const supportedChainIds = ["0x1", "0x2105", "0xa"]; // ethereum, base, optimism
    const aaAddresses = [
      DELEGATOR_ADDRESS, // Metamask
    ];
    const aaAddressToCodes = aaAddresses.map((aaAddress) => {
      return `0xef0100${aaAddress.slice(2)}`;
    }); // 7702 code format

    // The top-level keys are chain IDs in hexadecimal format
    // Chain ID "0x0" indicates capabilities supported across all chains, 그러나 그럴 일은 없음
    if (!supportedChainIds.includes(hexChainId)) {
      return {
        [hexChainId]: {
          atomic: {
            status: "unsupported",
          },
        },
      };
    }

    const response = await simpleFetch<{
      jsonrpc: string;
      id: number;
      result: any;
      error?: Error;
    }>(currentChainEVMInfo.rpc, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "request-source": origin,
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_getCode",
        params: [address, "latest"],
        id: 1,
      }),
    });

    const code = response.data.result as string;

    // check if the account is upgraded (the code is 7702 format (prefix 0xef0100 + 20 bytes address))
    if (code !== "0x") {
      const isSupported7702 = aaAddressToCodes.some((aaAddressToCode) => {
        return aaAddressToCode.toLowerCase() === code.toLowerCase();
      });
      if (isSupported7702) {
        // supported
        return {
          [hexChainId]: {
            atomic: {
              status: "supported",
            },
          },
        };
      }
    }

    // not upgraded but supported chain
    return {
      [hexChainId]: {
        atomic: {
          status: "ready",
        },
      },
    };
  }
}
