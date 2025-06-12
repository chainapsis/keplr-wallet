import { ChainGetter, QuerySharedContext } from "@keplr-wallet/stores";
import { computed, makeObservable } from "mobx";
import { ObservableStarknetChainJsonRpcQuery } from "../starknet-chain-json-rpc";

export class ObservableQueryStakingVersion extends ObservableStarknetChainJsonRpcQuery<
  string[]
> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, "starknet_call", {
      request: {
        // Staking Contract Address
        contract_address:
          "0x00ca1702e64c81d9a07b86bd2c540188d92a2c73cf5cc0e508d949015e7e84a7",
        calldata: [],
        // selector.getSelectorFromName("version")
        entry_point_selector:
          "0x021b4dd49a85c82b73f138b112d5135149203ed36c1ec80c46f8c572daa7c5ec",
      },
    });

    makeObservable(this);
  }

  protected override canFetch(): boolean {
    if (this.chainId === "starknet:SN_SEPOLIA") {
      return false;
    }

    return super.canFetch();
  }

  @computed
  get majorVersion(): string | undefined {
    if (!this.response || !this.response.data) {
      return undefined;
    }

    if (this.response.data.length < 1) {
      return undefined;
    }

    const hexVersion = this.response.data[0];
    const version = Buffer.from(hexVersion.slice(2), "hex").toString("utf-8");

    // semantic versioning
    const [major] = version.split(".");

    return major;
  }
}
