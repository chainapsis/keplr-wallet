import { autorun, makeObservable, observable, runInAction, toJS } from "mobx";
import { AppCurrency } from "@keplr-wallet/types";
import { ChainStore } from "../chain";
import { CosmosQueries, IQueriesStore } from "../query";
import { DenomHelper, KVStore } from "@keplr-wallet/common";
import { Bech32Address, ChainIdHelper } from "@keplr-wallet/cosmos";
import { BondStatus } from "../query/cosmos/staking/types";

type LSMDenomCacheData = {
  moniker: string | undefined;
  thumbnail: string | undefined;
  timestamp: number;
};

export class LSMCurrencyRegistrar {
  @observable.shallow
  protected lsmDenomCacheData: Map<string, LSMDenomCacheData> = new Map();

  @observable
  public isInitialized = false;

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly cacheDuration: number = 24 * 3600 * 1000, // 1 days
    protected readonly chainStore: ChainStore,
    protected readonly queriesStore: IQueriesStore<CosmosQueries>
  ) {
    this.chainStore.registerCurrencyRegistrar(
      this.lsmCurrencyRegistrar.bind(this)
    );

    makeObservable(this);

    this.init();
  }

  protected async init() {
    const key = `cache-lsm-denom-data`;
    const saved = await this.kvStore.get<Record<string, LSMDenomCacheData>>(
      key
    );
    if (saved) {
      runInAction(() => {
        for (const [key, value] of Object.entries(saved)) {
          if (Date.now() - value.timestamp < this.cacheDuration) {
            this.lsmDenomCacheData.set(key, value);
          }
        }
      });
    }

    autorun(() => {
      const js = toJS(this.lsmDenomCacheData);
      const obj = Object.fromEntries(js);
      this.kvStore.set<Record<string, LSMDenomCacheData>>(key, obj);
    });

    runInAction(() => {
      this.isInitialized = true;
    });
  }

  protected lsmCurrencyRegistrar(
    chainId: string,
    coinMinimalDenom: string
  ):
    | {
        value: AppCurrency | undefined;
        done: boolean;
      }
    | undefined {
    if (!this.chainStore.hasChain(chainId)) {
      return;
    }

    const denomHelper = new DenomHelper(coinMinimalDenom);
    if (denomHelper.type !== "native") {
      return;
    }

    const chainInfo = this.chainStore.getChain(chainId);
    if (!chainInfo.stakeCurrency) {
      return;
    }

    if (
      !chainInfo.bech32Config ||
      !coinMinimalDenom.startsWith(chainInfo.bech32Config.bech32PrefixValAddr)
    ) {
      return;
    }

    const i = coinMinimalDenom.indexOf("/");
    if (i < 0) {
      return;
    }

    const valAddress = coinMinimalDenom.slice(0, i);
    try {
      Bech32Address.validate(
        valAddress,
        chainInfo.bech32Config?.bech32PrefixValAddr
      );
    } catch {
      // noop
      return;
    }
    const id = parseInt(coinMinimalDenom.slice(i + 1));
    if (id.toString() !== coinMinimalDenom.slice(i + 1)) {
      return;
    }

    const queries = this.queriesStore.get(chainId);

    const validator:
      | {
          moniker: string | undefined;
          thumbnail: string | undefined;
          isFetching: boolean;
          fromCache: boolean;
        }
      | undefined = (() => {
      const cache = this.lsmDenomCacheData.get(
        `${ChainIdHelper.parse(chainId).identifier}/${coinMinimalDenom}`
      );

      if (cache && Date.now() - cache.timestamp < this.cacheDuration) {
        return {
          moniker: cache.moniker,
          thumbnail: cache.thumbnail,
          isFetching: false,
          fromCache: true,
        };
      }

      const q = [
        queries.cosmos.queryValidators.getQueryStatus(BondStatus.Bonded),
        queries.cosmos.queryValidators.getQueryStatus(BondStatus.Unbonded),
        queries.cosmos.queryValidators.getQueryStatus(BondStatus.Unbonding),
      ];

      for (const query of q) {
        const val = query.getValidator(valAddress);
        const thumbnail = query.getQueryValidatorThumbnail(valAddress);
        if (val) {
          return {
            moniker: val.description.moniker,
            // query에서는 thumbnail이 없으면 빈 문자열이 반환되는데, 밑의 로직에서는 없을 경우 명시적으로 undefined 여야 함.
            thumbnail:
              thumbnail && thumbnail.thumbnail
                ? thumbnail.thumbnail
                : undefined,
            isFetching:
              query.isFetching || (thumbnail ? thumbnail.isFetching : false),
            fromCache: false,
          };
        }

        if (query.isFetching) {
          return;
        }
      }
    })();

    if (!validator) {
      return {
        value: undefined,
        done: false,
      };
    }

    if (!validator.fromCache && !validator.isFetching) {
      runInAction(() => {
        this.lsmDenomCacheData.set(
          `${ChainIdHelper.parse(chainId).identifier}/${coinMinimalDenom}`,
          {
            moniker: validator.moniker,
            thumbnail: validator.thumbnail,
            timestamp: Date.now(),
          }
        );
      });
    }

    return {
      value: {
        coinMinimalDenom,
        coinDenom: `${(() => {
          if (validator.moniker) {
            let moniker = validator.moniker;
            if (moniker.length >= 10) {
              moniker = moniker.slice(0, 7) + "...";
            }
            return moniker;
          }

          return "Unknown";
        })()}/${id}`,
        coinDecimals: chainInfo.stakeCurrency.coinDecimals,
        coinImageUrl: validator.thumbnail || undefined,
      },
      done: !validator.isFetching,
    };
  }
}
