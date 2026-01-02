import { Dec, CoinPretty } from "@keplr-wallet/unit";
import { observable, makeObservable, computed, runInAction } from "mobx";
import { computedFn } from "mobx-utils";
import { QuerySharedContext } from "../../../common";
import { BondStatus, InitiaValidators, Validator } from "./types";
import { ObservableQueryValidatorThumbnail } from "./validators";
import {
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "../../chain-query";
import { ChainGetter } from "../../../chain";

export class ObservableQueryInitiaValidatorsInner extends ObservableChainQuery<InitiaValidators> {
  @observable.shallow
  protected thumbnailMap: Map<string, ObservableQueryValidatorThumbnail> =
    new Map();

  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    status: BondStatus
  ) {
    super(
      sharedContext,
      chainId,
      chainGetter,
      `/initia/mstaking/v1/validators?pagination.limit=1000&status=${(() => {
        switch (status) {
          case BondStatus.Bonded:
            return "BOND_STATUS_BONDED";
          case BondStatus.Unbonded:
            return "BOND_STATUS_UNBONDED";
          case BondStatus.Unbonding:
            return "BOND_STATUS_UNBONDING";
          default:
            return "BOND_STATUS_UNSPECIFIED";
        }
      })()}`
    );
    makeObservable(this);
  }

  protected override canFetch(): boolean {
    if (!this.chainGetter.getModularChainInfoImpl(this.chainId).stakeCurrency) {
      return false;
    }
    return super.canFetch();
  }

  @computed
  get validators(): Validator[] {
    if (!this.response) {
      return [];
    }

    const stakeCurrency = this.chainGetter.getModularChainInfoImpl(
      this.chainId
    ).stakeCurrency;

    if (!stakeCurrency) {
      return [];
    }

    const validators = this.response.data.validators;

    return validators.map((validator) => {
      return {
        ...validator,
        tokens:
          validator.tokens.find(
            (token) => token.denom === stakeCurrency.coinMinimalDenom
          )?.amount ?? "0",
        delegator_shares: validator.voting_power,
      };
    });
  }

  readonly getValidator = computedFn(
    (validatorAddress: string): Validator | undefined => {
      const validators = this.validators;

      return validators.find(
        (val) => val.operator_address === validatorAddress
      );
    }
  );

  @computed
  get validatorsSortedByVotingPower(): Validator[] {
    const validators = this.validators;
    return validators.sort((v1, v2) => {
      return new Dec(v1.tokens).gt(new Dec(v2.tokens)) ? -1 : 1;
    });
  }

  readonly getValidatorThumbnail = computedFn(
    (operatorAddress: string): string => {
      const query = this.getQueryValidatorThumbnail(operatorAddress);
      if (!query) {
        return "";
      }

      return query.thumbnail;
    }
  );

  readonly getQueryValidatorThumbnail = computedFn(
    (
      operatorAddress: string
    ): ObservableQueryValidatorThumbnail | undefined => {
      const validators = this.validators;
      const validator = validators.find(
        (val) => val.operator_address === operatorAddress
      );
      if (!validator) {
        return;
      }

      if (!validator.description.identity) {
        return;
      }

      const identity = validator.description.identity;

      if (!this.thumbnailMap.has(identity)) {
        runInAction(() => {
          this.thumbnailMap.set(
            identity,
            new ObservableQueryValidatorThumbnail(this.sharedContext, validator)
          );
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return this.thumbnailMap.get(identity)!;
    }
  );

  /**
   * Return the validator's voting power as human friendly (considering the coin decimals).
   */
  readonly getValidatorShare = computedFn(
    (operatorAddress: string): CoinPretty | undefined => {
      const validators = this.validators;
      const validator = validators.find(
        (val) => val.operator_address === operatorAddress
      );
      if (!validator) {
        return;
      }

      const chainInfo = this.chainGetter.getModularChainInfoImpl(this.chainId);
      const stakeCurrency = chainInfo.stakeCurrency;

      if (!stakeCurrency) {
        return;
      }

      return new CoinPretty(stakeCurrency, validator.tokens);
    }
  );
}

export class ObservableQueryInitiaValidators extends ObservableChainQueryMap<InitiaValidators> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, (status: string) => {
      return new ObservableQueryInitiaValidatorsInner(
        this.sharedContext,
        this.chainId,
        this.chainGetter,
        status as BondStatus
      );
    });
  }

  getQueryStatus(
    status: BondStatus = BondStatus.Bonded
  ): ObservableQueryInitiaValidatorsInner {
    return this.get(status) as ObservableQueryInitiaValidatorsInner;
  }
}
