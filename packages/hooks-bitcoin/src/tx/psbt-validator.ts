import { ChainGetter } from "@keplr-wallet/stores";
import { TxChainSetter } from "./chain";
import { makeObservable, observable } from "mobx";
import { BitcoinQueriesStore } from "@keplr-wallet/stores-bitcoin";
import { useState } from "react";
import { IAmountConfig, IFeeConfig } from "./types";
import { Psbt } from "bitcoinjs-lib";

type PsbtValidate = () => Promise<Psbt[]>;
export type PsbtValidateFn = () => PsbtValidate;

export class PsbtValidator extends TxChainSetter {
  @observable
  protected _error: Error | undefined = undefined;

  constructor(
    chainGetter: ChainGetter,
    initialChainId: string,
    protected readonly senderPublicKey: Uint8Array,
    protected readonly queriesStore: BitcoinQueriesStore,
    protected readonly amountConfig: IAmountConfig,
    protected readonly feeConfig: IFeeConfig,
    protected readonly validatePsbtFn: PsbtValidateFn
  ) {
    super(chainGetter, initialChainId);

    makeObservable(this);
  }
}

export const usePsbtValidator = (
  chainGetter: ChainGetter,
  chainId: string,
  senderPublicKey: Uint8Array,
  queriesStore: BitcoinQueriesStore,
  amountConfig: IAmountConfig,
  feeConfig: IFeeConfig,
  validatePsbtFn: PsbtValidateFn
) => {
  const [psbtValidator] = useState(() => {
    const psbtValidator = new PsbtValidator(
      chainGetter,
      chainId,
      senderPublicKey,
      queriesStore,
      amountConfig,
      feeConfig,
      validatePsbtFn
    );

    return psbtValidator;
  });
  psbtValidator.setChain(chainId);

  return psbtValidator;
};
