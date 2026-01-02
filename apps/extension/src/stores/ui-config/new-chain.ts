import {
  action,
  autorun,
  computed,
  makeObservable,
  observable,
  runInAction,
  toJS,
} from "mobx";
import {
  KVStore,
  PrefixKVStore,
  sortedJsonByKeyStringify,
} from "@keplr-wallet/common";
import { ChainStore } from "../chain";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import semver from "semver";
import { simpleFetch } from "@keplr-wallet/simple-fetch";
import Joi from "joi";
import { ChangelogConfig } from "./changelog";

interface Remote {
  version: string;
  chainIdentifier: string;
}

const Schema = Joi.object<{
  info: Remote[];
}>({
  info: Joi.array()
    .items(
      Joi.object({
        version: Joi.string().required(),
        chainIdentifier: Joi.string().required(),
      })
    )
    .required(),
});

export class NewChainSuggestionConfig {
  protected readonly kvStore: KVStore;

  protected _installedVersion: string = "";
  protected _currentVersion: string = "";

  @observable
  protected _turnOffSuggestionChains: string[] = [];

  @observable.ref
  protected _remote: Remote[] = [];

  constructor(
    kvStore: KVStore,
    protected readonly chainStore: ChainStore,
    public readonly changelogConfig: ChangelogConfig
  ) {
    this.kvStore = new PrefixKVStore(kvStore, "new-chain-suggestion");

    makeObservable(this);
  }

  async init(installedVersion: string, currentVersion: string): Promise<void> {
    this._installedVersion = installedVersion;
    this._currentVersion = currentVersion;

    {
      const saved = await this.kvStore.get<Remote[]>("remote");
      if (saved) {
        runInAction(() => {
          this._remote = saved;
        });
      }

      autorun(() => {
        this.kvStore.set<Remote[]>("remote", toJS(this._remote));
      });
    }

    {
      const saved = await this.kvStore.get<string[]>("turnOffSuggestionChains");
      if (saved) {
        runInAction(() => {
          this._turnOffSuggestionChains = saved;
        });
      }

      autorun(() => {
        this.kvStore.set<string[]>(
          "turnOffSuggestionChains",
          toJS(this._turnOffSuggestionChains)
        );
      });
    }

    // Must not wait.
    this.fetchRemote();
  }

  protected async fetchRemote(): Promise<void> {
    try {
      const res = await simpleFetch<{
        info: Remote[];
      }>(
        "https://gjsttg7mkgtqhjpt3mv5aeuszi0zblbb.lambda-url.us-west-2.on.aws/new-chain/info.json"
      );

      const validated = await Schema.validateAsync(res.data);

      runInAction(() => {
        if (
          sortedJsonByKeyStringify(toJS(this._remote)) !==
          sortedJsonByKeyStringify(validated.info)
        ) {
          this._remote = validated.info;
        }
      });
    } catch (e) {
      console.log(e);
    }
  }

  @computed
  get newSuggestionChains(): string[] {
    // UI 디자인상 changelog가 보여지는 경우에는 new chain noti(?)를 보여주지 않는다.
    if (this.changelogConfig.showingInfo.length > 0) {
      return [];
    }

    const res = [];

    for (const r of this._remote) {
      if (this.chainStore.hasModularChain(r.chainIdentifier)) {
        const identifier = ChainIdHelper.parse(r.chainIdentifier).identifier;

        if (!this.turnOffSuggestionChainsMap.get(identifier)) {
          try {
            if (
              semver.lt(this._installedVersion, r.version) &&
              semver.gte(this._currentVersion, r.version)
            ) {
              res.push(identifier);
            }
          } catch (e) {
            console.log(e);
            // noop
          }
        }
      }
    }

    return res;
  }

  @action
  turnOffSuggestionChains(...chainIdentifiers: string[]) {
    this._turnOffSuggestionChains.push(
      ...chainIdentifiers.map((c) => ChainIdHelper.parse(c).identifier)
    );
  }

  @computed
  protected get turnOffSuggestionChainsMap(): Map<string, boolean> {
    const res = new Map();
    for (const chain of this._turnOffSuggestionChains) {
      res.set(chain, true);
    }

    return res;
  }

  async removeStatesWhenErrorOccurredDuringRendering() {
    await this.kvStore.set("remote", null);
  }
}
