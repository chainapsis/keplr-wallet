import { ChainsService } from "../chains";
import { KeyRingService } from "../keyring";
import { InteractionService } from "../interaction";
import { AnalyticsService } from "../analytics";
import { Env } from "@keplr-wallet/router";
import { ChainInfo, EthSignType, EVMInfo } from "@keplr-wallet/types";
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
import {
  getBasicAccessPermissionType,
  getEVMAccessPermissionType,
  PermissionService,
} from "../permission";
import { BackgroundTxEthereumService } from "../tx-ethereum";

export class KeyRingEthereumService {
  static evmInfo(chainInfo: ChainInfo): EVMInfo | undefined {
    return chainInfo.evm;
  }

  constructor(
    protected readonly chainsService: ChainsService,
    protected readonly keyRingService: KeyRingService,
    // XXX: 미래에는 cosmos와 분리되어서 ethereum을 다뤄야하는데 현재는 그냥 ethermint 계열에서만 작동하기 때문에
    //      keyring-cosmos의 기능들도 사용한다.
    protected readonly keyRingCosmosService: KeyRingCosmosService,
    protected readonly interactionService: InteractionService,
    protected readonly analyticsService: AnalyticsService,
    protected readonly permissionService: PermissionService,
    protected readonly backgroundTxEthereumService: BackgroundTxEthereumService
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
  ): Promise<Uint8Array> {
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
  ): Promise<Uint8Array> {
    const chainInfo = this.chainsService.getChainInfoOrThrow(chainId);
    if (chainInfo.hideInUI) {
      throw new Error("Can't sign for hidden chain");
    }
    const isEthermintLike = KeyRingService.isEthermintLike(chainInfo);
    const evmInfo = KeyRingEthereumService.evmInfo(chainInfo);

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
    const bech32Prefix =
      this.chainsService.getChainInfoOrThrow(chainId).bech32Config
        .bech32PrefixAccAddr;
    const bech32Address = new Bech32Address(key.address).toBech32(bech32Prefix);
    const ethereumHexAddress = Bech32Address.fromBech32(
      bech32Address,
      bech32Prefix
    ).toHex(false);
    if (signer !== bech32Address && signer !== ethereumHexAddress) {
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
      async (res: { signature?: Uint8Array }) => {
        if (keyInfo.type === "ledger" || keyInfo.type === "keystone") {
          if (!res.signature || res.signature.length === 0) {
            throw new Error("Frontend should provide signature");
          }
          return res.signature;
        } else {
          switch (signType) {
            case EthSignType.MESSAGE: {
              const signature = await this.keyRingService.sign(
                chainId,
                vaultId,
                Buffer.concat([
                  Buffer.from("\x19Ethereum Signed Message:\n"),
                  Buffer.from(message.length.toString()),
                  message,
                ]),
                "keccak256"
              );
              return Buffer.concat([
                signature.r,
                signature.s,
                // The metamask doesn't seem to consider the chain id in this case... (maybe bug on metamask?)
                signature.v
                  ? Buffer.from("1c", "hex")
                  : Buffer.from("1b", "hex"),
              ]);
            }
            case EthSignType.TRANSACTION: {
              const unsignedTx = JSON.parse(Buffer.from(message).toString());

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
              return Buffer.concat([
                signature.r,
                signature.s,
                // The metamask doesn't seem to consider the chain id in this case... (maybe bug on metamask?)
                signature.v
                  ? Buffer.from("1c", "hex")
                  : Buffer.from("1b", "hex"),
              ]);
            }
            case EthSignType.EIP712: {
              const data = await EIP712MessageValidator.validateAsync(
                JSON.parse(Buffer.from(message).toString())
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
              return Buffer.concat([
                signature.r,
                signature.s,
                // The metamask doesn't seem to consider the chain id in this case... (maybe bug on metamask?)
                signature.v
                  ? Buffer.from("1c", "hex")
                  : Buffer.from("1b", "hex"),
              ]);
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
    defaultChainId: string,
    method: string,
    params?: any[]
  ): Promise<any> {
    const chainInfo = this.chainsService.getChainInfo(defaultChainId);
    if (chainInfo === undefined || chainInfo.evm === undefined) {
      throw new Error("No chain info or EVM info provided");
    }

    const pubkey = await this.keyRingService.getPubKeySelected(
      chainInfo.chainId
    );
    const selectedAddress = `0x${Buffer.from(pubkey.getEthAddress()).toString(
      "hex"
    )}`;
    const evmInfo = chainInfo.evm;

    switch (method) {
      case "keplr_connect": {
        return {
          defaultEvmChainId: `0x${evmInfo.chainId.toString(16)}`,
          defaultTendermintChainId: chainInfo.chainId,
          selectedAddress,
        };
      }
      case "keplr_disconnect": {
        return this.permissionService.removeEVMPermission(
          getEVMAccessPermissionType(),
          [origin]
        );
      }
      case "eth_chainId": {
        return `0x${evmInfo.chainId.toString(16)}`;
      }
      case "eth_accounts":
      case "eth_requestAccounts": {
        return [selectedAddress];
      }
      case "eth_sendTransaction": {
        const tx = params?.[0];
        if (!tx) {
          throw new Error("No transaction provided");
        }

        const transactionCountResponse = await simpleFetch<{
          result: string;
        }>(evmInfo.rpc, {
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
        const nonce = transactionCountResponse.data.result;

        const unsignedTx: UnsignedTransaction = {
          ...tx,
          chainId: evmInfo.chainId,
          nonce,
        };

        const sender = tx.from;
        const signature = await this.signEthereumSelected(
          env,
          origin,
          defaultChainId,
          sender,
          Buffer.from(JSON.stringify(unsignedTx)),
          EthSignType.TRANSACTION
        );

        const isEIP1559 =
          !!unsignedTx.maxFeePerGas || !!unsignedTx.maxPriorityFeePerGas;
        if (isEIP1559) {
          unsignedTx.type = TransactionTypes.eip1559;
        }

        const signedTx = Buffer.from(
          serialize(unsignedTx, signature).replace("0x", ""),
          "hex"
        );

        const txHash = await this.backgroundTxEthereumService.sendEthereumTx(
          defaultChainId,
          signedTx,
          {}
        );

        return txHash;
      }
      case "personal_sign": {
        const message = params?.[0];
        if (!message) {
          throw new Error(
            "Invalid parameters: must provide a stringified message."
          );
        }

        const signer = params?.[1];
        if (!signer || (signer && !signer.match(/^0x[0-9A-Fa-f]*$/))) {
          throw new Error(
            "Invalid parameters: must provide an Ethereum address."
          );
        }

        const signature = await this.signEthereumSelected(
          env,
          origin,
          defaultChainId,
          signer,
          Buffer.from(message),
          EthSignType.MESSAGE
        );

        return `0x${Buffer.from(signature).toString("hex")}`;
      }
      case "eth_signTypedData_v3":
      case "eth_signTypedData_v4": {
        const signer = params?.[0];
        if (!signer || (signer && !signer.match(/^0x[0-9A-Fa-f]*$/))) {
          throw new Error(
            "Invalid parameters: must provide an Ethereum address."
          );
        }

        const typedData = params?.[1];

        const signature = await this.signEthereumSelected(
          env,
          origin,
          defaultChainId,
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
        const evmChainId = params?.[0]?.chainId;
        if (!evmChainId) {
          throw new Error("No chain id provided");
        }

        const chainInfos = this.chainsService.getChainInfos();

        const newChainInfo = chainInfos.find(
          (chainInfo) => chainInfo.evm?.chainId === parseInt(evmChainId, 16)
        );
        if (!newChainInfo) {
          throw new Error("No matched chain found");
        }

        await this.permissionService.checkOrGrantPermission(
          env,
          [newChainInfo.chainId],
          getBasicAccessPermissionType(),
          origin
        );

        return this.permissionService.updateDefaultChainIdPermittedOrigin(
          env,
          origin,
          newChainInfo.chainId
        );
      }
      default: {
        return (
          await simpleFetch<{
            jsonrpc: string;
            id: number;
            result: any;
            error?: Error;
          }>(evmInfo.rpc, {
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
    }
  }
}
