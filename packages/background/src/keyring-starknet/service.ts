import { ChainsService } from "../chains";
import { KeyRingService } from "../keyring";
import { Buffer } from "buffer/";

export class KeyRingStarknetService {
  constructor(
    protected readonly chainsService: ChainsService,
    protected readonly keyRingService: KeyRingService
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
}
