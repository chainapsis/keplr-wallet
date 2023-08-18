import { ChainsService } from "../chains";
import { KeyRingService } from "../keyring";
import { InteractionService } from "../interaction";
import { AnalyticsService } from "../analytics";
import { Env } from "@keplr-wallet/router";
import { EthSignType } from "@keplr-wallet/types";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { Buffer } from "buffer/";
import {
  domainHash,
  EIP712MessageValidator,
  KeyRingCosmosService,
  messageHash,
} from "../keyring-cosmos";
import { serialize } from "@ethersproject/transactions";

export class KeyRingEthereumService {
  constructor(
    protected readonly chainsService: ChainsService,
    protected readonly keyRingService: KeyRingService,
    // XXX: 미래에는 cosmos와 분리되어서 ethereum을 다뤄야하는데 현재는 그냥 ethermint 계열에서만 작동하기 때문에
    //      keyring-cosmos의 기능들도 사용한다.
    protected readonly keyRingCosmosService: KeyRingCosmosService,
    protected readonly interactionService: InteractionService,
    protected readonly analyticsService: AnalyticsService
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
    const isEthermintLike = KeyRingService.isEthermintLike(chainInfo);

    if (!isEthermintLike) {
      throw new Error("Not ethermint like chain");
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

    const key = await this.keyRingCosmosService.getKey(vaultId, chainId);
    const bech32Prefix =
      this.chainsService.getChainInfoOrThrow(chainId).bech32Config
        .bech32PrefixAccAddr;
    const bech32Address = new Bech32Address(key.address).toBech32(bech32Prefix);
    if (signer !== bech32Address) {
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
              const tx = JSON.parse(Buffer.from(message).toString());
              const signature = await this.keyRingService.sign(
                chainId,
                vaultId,
                Buffer.from(serialize(tx).replace("0x", ""), "hex"),
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
}
