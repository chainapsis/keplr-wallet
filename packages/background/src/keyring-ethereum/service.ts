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
} from "@keplr-wallet/types";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { Buffer } from "buffer/";
import {
  domainHash,
  EIP712MessageValidator,
  KeyRingCosmosService,
  messageHash,
} from "../keyring-cosmos";
import {
  serialize,
  TransactionTypes,
  UnsignedTransaction,
} from "@ethersproject/transactions";
import { simpleFetch } from "@keplr-wallet/simple-fetch";
import { getBasicAccessPermissionType, PermissionService } from "../permission";
import { BackgroundTxEthereumService } from "../tx-ethereum";
import { TokenERC20Service } from "../token-erc20";
import { validateEVMChainId } from "./helper";
import { runInAction } from "mobx";
import { PermissionInteractiveService } from "../permission-interactive";
import { enableAccessSkippedEVMJSONRPCMethods } from "./constants";

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
    protected readonly tokenERC20Service: TokenERC20Service
  ) {}

  async init() {
    // TODO: ?
  }

  async signEthereumSelected(
    env: Env,
    origin: string,
    chainId: string,
    signer: string,
    message: Uint8Array,
    signType: EthSignType
  ): Promise<EthereumSignResponse> {
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
    const chainInfo = this.chainsService.getModularChainInfoOrThrow(chainId);
    if ("cosmos" in chainInfo && chainInfo.cosmos.hideInUI) {
      throw new Error("Can't sign for hidden chain");
    }
    const isEthermintLike = KeyRingService.isEthermintLike(chainInfo);
    const evmInfo = ChainsService.getEVMInfo(chainInfo);
    const forceEVMLedger = Boolean(
      ("evm" in chainInfo &&
        chainInfo.evm?.features?.includes("force-enable-evm-ledger")) ||
        ("cosmos" in chainInfo &&
          chainInfo.cosmos.features?.includes("force-enable-evm-ledger")) ||
        false
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
        throw new Error("EIP-7702 transactions are not supported.");
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
                const unsignedTx = JSON.parse(
                  Buffer.from(res.signingData).toString()
                );

                const isEIP1559 =
                  !!unsignedTx.maxFeePerGas ||
                  !!unsignedTx.maxPriorityFeePerGas;
                if (isEIP1559) {
                  unsignedTx.type = TransactionTypes.eip1559;
                }

                delete unsignedTx.from;

                const signature = await this.keyRingService.sign(
                  chainId,
                  vaultId,
                  Buffer.from(serialize(unsignedTx).replace("0x", ""), "hex"),
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
          const tx =
            (Array.isArray(params) &&
              (params?.[0] as {
                chainId?: string | number;
                from: string;
                gas?: string;
                gasLimit?: string;
                authorizationList?: {
                  address: string;
                  chainId: string;
                  nonce: string;
                  r: string;
                  s: string;
                  yParity: string;
                }[];
              })) ||
            null;
          if (!tx) {
            throw new EthereumProviderRpcError(
              -32602,
              "Invalid params",
              "Must provide a transaction."
            );
          }

          const currentChainId = this.forceGetCurrentChainId(origin, chainId);

          const { from: sender, gas, authorizationList, ...restTx } = tx;

          if (authorizationList) {
            throw new Error("EIP-7702 transactions are not supported.");
          }

          if (tx.chainId) {
            const evmChainIdFromTx: number = validateEVMChainId(
              (() => {
                if (typeof tx.chainId === "string") {
                  if (tx.chainId.startsWith("0x")) {
                    return parseInt(tx.chainId, 16);
                  } else {
                    return parseInt(tx.chainId, 10);
                  }
                } else {
                  return tx.chainId;
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
          const nonce = parseInt(transactionCount, 16);

          const unsignedTx: UnsignedTransaction = {
            ...restTx,
            gasLimit: restTx?.gasLimit ?? gas,
            chainId: this.getEVMChainId(currentChainId),
            nonce,
          };

          try {
            const { signingData, signature } = await this.signEthereumSelected(
              env,
              origin,
              currentChainId,
              sender,
              Buffer.from(JSON.stringify(unsignedTx)),
              EthSignType.TRANSACTION
            );

            const signingTx = JSON.parse(Buffer.from(signingData).toString());

            const isEIP1559 =
              !!signingTx.maxFeePerGas || !!signingTx.maxPriorityFeePerGas;
            if (isEIP1559) {
              signingTx.type = TransactionTypes.eip1559;
            }

            const signedTx = Buffer.from(
              serialize(signingTx, signature).replace("0x", ""),
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
          const tx =
            (Array.isArray(params) &&
              (params?.[0] as {
                chainId?: string | number;
                from: string;
                gas?: string;
                gasLimit?: string;
                authorizationList?: {
                  address: string;
                  chainId: string;
                  nonce: string;
                  r: string;
                  s: string;
                  yParity: string;
                }[];
              })) ||
            null;
          if (!tx) {
            throw new EthereumProviderRpcError(
              -32602,
              "Invalid params",
              "Must provide a transaction."
            );
          }

          const currentChainId = this.forceGetCurrentChainId(origin, chainId);

          const { from: sender, gas, authorizationList, ...restTx } = tx;

          if (authorizationList) {
            throw new Error("EIP-7702 transactions are not supported.");
          }

          if (tx.chainId) {
            const evmChainIdFromTx: number = validateEVMChainId(
              (() => {
                if (typeof tx.chainId === "string") {
                  if (tx.chainId.startsWith("0x")) {
                    return parseInt(tx.chainId, 16);
                  } else {
                    return parseInt(tx.chainId, 10);
                  }
                } else {
                  return tx.chainId;
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
          const nonce = parseInt(transactionCount, 16);

          const unsignedTx: UnsignedTransaction = {
            ...restTx,
            gasLimit: restTx?.gasLimit ?? gas,
            chainId: this.getEVMChainId(currentChainId),
            nonce,
          };

          try {
            const { signingData, signature } = await this.signEthereumSelected(
              env,
              origin,
              currentChainId,
              sender,
              Buffer.from(JSON.stringify(unsignedTx)),
              EthSignType.TRANSACTION
            );

            const signingTx = JSON.parse(Buffer.from(signingData).toString());

            const isEIP1559 =
              !!signingTx.maxFeePerGas || !!signingTx.maxPriorityFeePerGas;
            if (isEIP1559) {
              signingTx.type = TransactionTypes.eip1559;
            }

            const signedTx = serialize(signingTx, signature);

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
                chainSymbolImageUrl:
                  iconUrls && typeof iconUrls[0] === "string" && !!iconUrls[0]
                    ? iconUrls[0]
                    : undefined,
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
}
