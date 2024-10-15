import { ChainGetter, QuerySharedContext } from "@keplr-wallet/stores";
import {
  ObservableStarknetChainJsonRpcQuery,
  ObservableStarknetChainJsonRpcQueryMap,
} from "./starknet-chain-json-rpc";

export class ObservableQueryAccountNonceInner extends ObservableStarknetChainJsonRpcQuery<AccountNonce> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    public readonly address: string
  ) {
    super(sharedContext, chainId, chainGetter, "starknet_getNonce", {
      contract_address: address,
    });
  }
}

export class ObservableQueryAccountNonce extends ObservableStarknetChainJsonRpcQueryMap<AccountNonce> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, (key) => {
      return new ObservableQueryAccountNonceInner(
        sharedContext,
        chainId,
        chainGetter,
        key
      );
    });
  }

  getNonce(address: string): ObservableQueryAccountNonceInner {
    return this.get(address) as ObservableQueryAccountNonceInner;
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AccountNonce {
  // TODO: 현재는 그냥 account가 존재하는지 아닌지만 파악하려는거고 실제로 nonce를 가져올 필요는 없어서 일단 대충 냅둠.
}
