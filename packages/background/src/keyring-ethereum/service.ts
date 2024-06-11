import { ChainsService } from "../chains";
import { KeyRingService } from "../keyring";
import { InteractionService } from "../interaction";
import { AnalyticsService } from "../analytics";
import { Env, WEBPAGE_PORT } from "@keplr-wallet/router";
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
export class KeyRingEthereumService {
  constructor(
    protected readonly chainsService: ChainsService,
    protected readonly keyRingService: KeyRingService,
    // XXX: 미래에는 cosmos와 분리되어서 ethereum을 다뤄야하는데 현재는 그냥 ethermint 계열에서만 작동하기 때문에
    //      keyring-cosmos의 기능들도 사용한다.
    protected readonly keyRingCosmosService: KeyRingCosmosService,
    protected readonly interactionService: InteractionService,
    protected readonly analyticsService: AnalyticsService,
    protected readonly permissionService: PermissionService,
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
    const chainInfo = this.chainsService.getChainInfoOrThrow(chainId);
    if (chainInfo.hideInUI) {
      throw new Error("Can't sign for hidden chain");
    }
    const isEthermintLike = KeyRingService.isEthermintLike(chainInfo);
    const evmInfo = ChainsService.getEVMInfo(chainInfo);

    if (!isEthermintLike && !evmInfo) {
      throw new Error("Not ethermint like and EVM chain");
    }

    const keyInfo = this.keyRingService.getKeyInfo(vaultId);
    if (!keyInfo) {
      throw new Error("Null key info");
    }

    if (keyInfo.type === "ledger") {
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
        signType,
        keyType: keyInfo.type,
        keyInsensitive: keyInfo.insensitive,
      },
      async (res: { signingData: Uint8Array; signature?: Uint8Array }) => {
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
                !!unsignedTx.maxFeePerGas || !!unsignedTx.maxPriorityFeePerGas;
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
      }
    );
  }

  async request(
    env: Env,
    origin: string,
    currentChainId: string,
    method: string,
    params?: unknown[] | Record<string, unknown>
  ): Promise<any> {
    const currentChainInfo =
      this.chainsService.getChainInfoOrThrow(currentChainId);
    const currentChainEVMInfo =
      this.chainsService.getEVMInfoOrThrow(currentChainId);

    const pubkey = await this.keyRingService.getPubKeySelected(
      currentChainInfo.chainId
    );
    const selectedAddress = `0x${Buffer.from(pubkey.getEthAddress()).toString(
      "hex"
    )}`;

    switch (method) {
      case "keplr_connect": {
        return {
          currentEvmChainId: currentChainEVMInfo.chainId,
          currentChainId: currentChainInfo.chainId,
          selectedAddress,
        };
      }
      case "keplr_disconnect": {
        return this.permissionService.removePermission(
          currentChainId,
          getBasicAccessPermissionType(),
          [origin]
        );
      }
      case "eth_chainId": {
        return `0x${currentChainEVMInfo.chainId.toString(16)}`;
      }
      case "net_version": {
        return currentChainEVMInfo.chainId.toString();
      }
      case "eth_accounts":
      case "eth_requestAccounts": {
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
            })) ||
          null;
        if (!tx) {
          throw new Error("Invalid parameters: must provide a transaction.");
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
          if (evmChainIdFromTx !== currentChainEVMInfo.chainId) {
            throw new Error(
              "The current active chain id does not match the one in the transaction."
            );
          }
        }

        const transactionCountResponse = await simpleFetch<{
          result: string;
        }>(currentChainEVMInfo.rpc, {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "eth_getTransactionCount",
            params: [selectedAddress, "pending"],
            id: 1,
          }),
        });
        const nonce = parseInt(transactionCountResponse.data.result, 16);

        const { from: sender, gas, ...restTx } = tx;
        const unsignedTx: UnsignedTransaction = {
          ...restTx,
          gasLimit: restTx?.gasLimit ?? gas,
          chainId: currentChainEVMInfo.chainId,
          nonce,
        };

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

        const txHash = await this.backgroundTxEthereumService.sendEthereumTx(
          currentChainId,
          signedTx,
          {}
        );

        return txHash;
      }
      case "personal_sign": {
        const message =
          (Array.isArray(params) && (params?.[0] as string)) || undefined;
        if (!message) {
          throw new Error(
            "Invalid parameters: must provide a stringified message."
          );
        }

        const signer =
          (Array.isArray(params) && (params?.[1] as string)) || undefined;
        if (!signer || (signer && !signer.match(/^0x[0-9A-Fa-f]*$/))) {
          throw new Error(
            "Invalid parameters: must provide an Ethereum address."
          );
        }

        const { signature } = await this.signEthereumSelected(
          env,
          origin,
          currentChainId,
          signer,
          Buffer.from(message),
          EthSignType.MESSAGE
        );

        return `0x${Buffer.from(signature).toString("hex")}`;
      }
      case "eth_signTypedData_v3":
      case "eth_signTypedData_v4": {
        const signer =
          (Array.isArray(params) && (params?.[0] as string)) || undefined;
        if (!signer || (signer && !signer.match(/^0x[0-9A-Fa-f]*$/))) {
          throw new Error(
            "Invalid parameters: must provide an Ethereum address."
          );
        }

        const typedData =
          (Array.isArray(params) && (params?.[1] as any)) || undefined;

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
      }
      case "wallet_switchEthereumChain": {
        const param =
          (Array.isArray(params) && (params?.[0] as { chainId: string })) ||
          undefined;
        if (!param?.chainId) {
          throw new Error("Invalid parameters: must provide a chain id.");
        }

        const newEvmChainId = validateEVMChainId(parseInt(param.chainId, 16));
        if (newEvmChainId === currentChainEVMInfo.chainId) {
          return;
        }

        const chainInfos = this.chainsService.getChainInfos();

        const newCurrentChainInfo = chainInfos.find(
          (chainInfo) => chainInfo.evm?.chainId === newEvmChainId
        );
        if (!newCurrentChainInfo) {
          throw new Error("No matched EVM chain found in Keplr.");
        }

        await this.permissionService.checkOrGrantPermission(
          env,
          [newCurrentChainInfo.chainId],
          getBasicAccessPermissionType(),
          origin
        );

        await this.permissionService.updateCurrentChainIdForEVM(
          env,
          origin,
          newCurrentChainInfo.chainId
        );

        return this.interactionService.dispatchEvent(
          WEBPAGE_PORT,
          "keplr_chainChanged",
          {
            origin,
            evmChainId: newEvmChainId,
          }
        );
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
          throw new Error(
            "Invalid parameters: must provide a single object parameter."
          );
        }

        const evmChainId = validateEVMChainId(parseInt(param.chainId, 16));
        // Skip the validation for these parameters because they will be validated in the `suggestChainInfo` method.
        const { chainName, nativeCurrency, rpcUrls, iconUrls } = param;

        const addingChainInfo = {
          rpc: rpcUrls[0],
          rest: rpcUrls[0],
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
            rpc: param.rpcUrls[0],
          },
          features: ["eth-address-gen", "eth-key-sign"],
          chainSymbolImageUrl: iconUrls?.[0],
          beta: true,
        } as ChainInfo;

        await this.chainsService.suggestChainInfo(env, addingChainInfo, origin);

        this.permissionService.addPermission(
          [addingChainInfo.chainId],
          getBasicAccessPermissionType(),
          [origin]
        );

        // TODO: Switch current chain to the added chain.

        return null;
      }
      case "wallet_getPermissions":
      // This `request` method can be executed if the basic access permission is granted.
      // So, it's not necessary to check or grant the permission here.
      case "wallet_requestPermissions": {
        return [{ parentCapability: "eth_accounts" }];
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
        if (param?.type !== "ERC20") {
          throw new Error("Not a supported asset type.");
        }

        const contractAddress = param?.options.address;

        await this.tokenERC20Service.suggestERC20Token(
          env,
          currentChainId,
          contractAddress
        );

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
        throw new Error(`The method "${method}" is not supported.`);
      }
    }
  }
}
