import {
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "../../chain-query";
import { BondStatus, Validators, Validator } from "./types";
import { KVStore } from "@keplr-wallet/common";
import { ChainGetter } from "../../../common";
import { computed, makeObservable, observable, runInAction } from "mobx";
import { ObservableQuery, QueryResponse } from "../../../common";
import Axios, { CancelToken } from "axios";
import PQueue from "p-queue";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { computedFn } from "mobx-utils";

interface KeybaseResult {
  status: {
    code: number;
    name: string;
  };
  them?: [
    {
      id?: string;
      pictures?: {
        primary?: {
          url?: string;
        };
      };
    }
  ];
}

/**
 * Fetch the validator's thumbnail from keybase if the identity exists.
 */
export class ObservableQueryValidatorThumbnail extends ObservableQuery<KeybaseResult> {
  /**
   * Throttle down fetching the thumbnail from Keybase.
   * If too many requests occurs at the same time, Keybase will reject these requests.
   * @protected
   */
  protected static fetchingThumbnailQueue: PQueue = new PQueue({
    concurrency: 3,
  });

  protected readonly validator: Validator;

  constructor(kvStore: KVStore, validator: Validator) {
    const instance = Axios.create({
      baseURL: "https://keybase.io/",
    });

    super(
      kvStore,
      instance,
      `_/api/1.0/user/lookup.json?fields=pictures&key_suffix=${validator.description.identity}`
    );
    makeObservable(this);

    this.validator = validator;
  }

  protected canFetch(): boolean {
    return this.validator.description.identity !== "";
  }

  protected async fetchResponse(
    cancelToken: CancelToken
  ): Promise<{ response: QueryResponse<KeybaseResult>; headers: any }> {
    return await ObservableQueryValidatorThumbnail.fetchingThumbnailQueue.add(
      () => {
        return super.fetchResponse(cancelToken);
      }
    );
  }

  @computed
  get thumbnail(): string {
    if (this.response?.data.status.code === 0) {
      if (this.response.data.them && this.response.data.them.length > 0) {
        return this.response.data.them[0].pictures?.primary?.url ?? "";
      }
    }

    return "";
  }
}

export class ObservableQueryValidatorsInner extends ObservableChainQuery<Validators> {
  @observable.shallow
  protected thumbnailMap: Map<
    string,
    ObservableQueryValidatorThumbnail
  > = new Map();

  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly status: BondStatus
  ) {
    super(
      kvStore,
      chainId,
      chainGetter,
      `/cosmos/staking/v1beta1/validators?pagination.limit=1000&status=${(() => {
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

  @computed
  get validators(): Validator[] {
    if (!this.response) {
      return [];
    }

    return this.response.data.validators;
  }

  readonly getValidator = computedFn((validatorAddress: string):
    | Validator
    | undefined => {
    const validators = this.validators;

    return validators.find((val) => val.operator_address === validatorAddress);
  });

  @computed
  get validatorsSortedByVotingPower(): Validator[] {
    const validators = this.validators;
    return validators.sort((v1, v2) => {
      return new Dec(v1.tokens).gt(new Dec(v2.tokens)) ? -1 : 1;
    });
  }

  readonly getValidatorThumbnail = computedFn(
    (operatorAddress: string): string => {
      const validators = this.validators;
      const validator = validators.find(
        (val) => val.operator_address === operatorAddress
      );
      if (!validator) {
        return "";
      }

      if (!validator.description.identity) {
        return "";
      }

      const identity = validator.description.identity;

      if (!this.thumbnailMap.has(identity)) {
        runInAction(() => {
          this.thumbnailMap.set(
            identity,
            new ObservableQueryValidatorThumbnail(this.kvStore, validator)
          );
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return this.thumbnailMap.get(identity)!.thumbnail;
    }
  );

  /**
   * Return the validator's voting power as human friendly (considering the coin decimals).
   */
  readonly getValidatorShare = computedFn((operatorAddress: string):
    | CoinPretty
    | undefined => {
    const validators = this.validators;
    const validator = validators.find(
      (val) => val.operator_address === operatorAddress
    );
    if (!validator) {
      return;
    }

    const chainInfo = this.chainGetter.getChain(this.chainId);
    const stakeCurrency = chainInfo.stakeCurrency;

    const power = new Dec(validator.tokens).truncate();

    return new CoinPretty(stakeCurrency, power);
  });
}

export class ObservableQueryValidators extends ObservableChainQueryMap<Validators> {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super(kvStore, chainId, chainGetter, (status: string) => {
      return new ObservableQueryValidatorsInner(
        this.kvStore,
        this.chainId,
        this.chainGetter,
        status as BondStatus
      );
    });
  }

  getQueryStatus(
    status: BondStatus = BondStatus.Bonded
  ): ObservableQueryValidatorsInner {
    return this.get(status) as ObservableQueryValidatorsInner;
  }
}
