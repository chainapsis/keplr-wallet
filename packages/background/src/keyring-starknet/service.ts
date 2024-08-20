import { Env } from "@keplr-wallet/router";
import { ChainsService } from "../chains";
import { KeyRingService } from "../keyring";
import { Buffer } from "buffer/";
import { PermissionService } from "../permission";

export class KeyRingStarknetService {
  constructor(
    protected readonly chainsService: ChainsService,
    protected readonly keyRingService: KeyRingService,
    protected readonly permissionService: PermissionService
  ) {}

  async init() {
    // TODO: ?
  }

  async getStarknetKeySelected(chainId: string): Promise<{
    hexAddress: string;
    pubKey: Uint8Array;
    address: Uint8Array;
  }> {
    return await this.getStarknetKey(
      this.keyRingService.selectedVaultId,
      chainId
    );
  }

  async getStarknetKey(
    vaultId: string,
    chainId: string
  ): Promise<{
    hexAddress: string;
    pubKey: Uint8Array;
    address: Uint8Array;
  }> {
    const chainInfo = this.chainsService.getModularChainInfoOrThrow(chainId);
    if (!("starknet" in chainInfo)) {
      throw new Error("Chain is not a starknet chain");
    }
    const pubKey = await this.keyRingService.getPubKey(chainId, vaultId);

    // TODO: salt를 어떻게 할지 생각한다...
    //       class hash의 경우도 생각해야함...
    const address = pubKey.getStarknetAddress(
      Buffer.from("11", "hex"),
      Buffer.from(
        "02203673e728fa07de1c2ea60405399ffefaf875f1b7ae54e747659e1e216d94",
        "hex"
      )
    );

    return {
      hexAddress: `0x${Buffer.from(address).toString("hex")}`,
      pubKey: pubKey.toBytes(),
      address,
    };
  }

  async request<T = any>(
    env: Env,
    origin: string,
    type: string,
    params?: unknown[] | Record<string, unknown>,
    chainId?: string
  ): Promise<T> {
    if (env.isInternalMsg && chainId == null) {
      throw new Error(
        "The chain id must be provided for the internal message."
      );
    }

    const currentChainId =
      this.permissionService.getCurrentChainIdForStarknet(origin) ?? chainId;
    if (currentChainId == null) {
      if (type === "keplr_initStarknetProviderState") {
        return {
          currentChainId: null,
          selectedAddress: null,
        } as T;
      } else {
        throw new Error(
          `${origin} is not permitted. Please disconnect and reconnect to the website.`
        );
      }
    }
    const selectedAddress = (await this.getStarknetKeySelected(currentChainId))
      .hexAddress;

    const result = (await (async () => {
      switch (type) {
        case "keplr_initStarknetProviderState":
        case "keplr_enableStarknetProvider": {
          console.log(params);
          return {
            currentChainId,
            selectedAddress,
          };
        }
        default: {
          throw new Error(`The type "${type}" is not supported.`);
        }
      }
    })()) as T;

    return result;
  }
}
