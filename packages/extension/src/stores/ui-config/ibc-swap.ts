import { KVStore, PrefixKVStore } from "@keplr-wallet/common";
import { action, autorun, makeObservable, observable, runInAction } from "mobx";
import { ChainStore } from "../chain";
import { computedFn } from "mobx-utils";
import { IChainInfoImpl } from "@keplr-wallet/stores";
import { AppCurrency } from "@keplr-wallet/types";

export class IBCSwapConfig {
  protected readonly kvStore: KVStore;

  // 사실 UI 관련된 얘들은 ui config store 밑에 넣거나... 다른 곳으로 빠지는게 맞는 것 같지만...
  // 일단은 귀찮아서 여기서 처리한다...
  @observable
  protected _lastAmountInChainId: string = "";
  @observable
  protected _lastAmountInMinimalDenom: string = "";
  @observable
  protected _lastAmountOutChainId: string = "";
  @observable
  protected _lastAmountOutMinimalDenom: string = "";

  @observable
  protected _lastSlippage: string = "0.5";
  @observable
  protected _lastSlippageIsCustom: boolean = false;

  constructor(kvStore: KVStore, protected readonly chainStore: ChainStore) {
    this.kvStore = new PrefixKVStore(kvStore, "ibc-swap");

    makeObservable(this);
  }

  async init(): Promise<void> {
    const saved = await this.kvStore.get<{
      lastAmountInChainId: string;
      lastAmountInMinimalDenom: string;
      lastAmountOutChainId: string;
      lastAmountOutMinimalDenom: string;
    }>("ibc-swap-amount-in-out-info");
    if (saved) {
      runInAction(() => {
        if (saved.lastAmountInChainId) {
          this._lastAmountInChainId = saved.lastAmountInChainId;
        }
        if (saved.lastAmountInMinimalDenom) {
          this._lastAmountInMinimalDenom = saved.lastAmountInMinimalDenom;
        }
        if (saved.lastAmountOutChainId) {
          this._lastAmountOutChainId = saved.lastAmountOutChainId;
        }
        if (saved.lastAmountOutMinimalDenom) {
          this._lastAmountOutMinimalDenom = saved.lastAmountOutMinimalDenom;
        }
      });
    }

    const savedSlippage = await this.kvStore.get<{
      lastSlippage: string;
      lastSlippageIsCustom: boolean;
    }>("ibc-swap-slippage");
    if (savedSlippage) {
      runInAction(() => {
        if (savedSlippage.lastSlippage != null) {
          this._lastSlippage = savedSlippage.lastSlippage;
        }
        if (savedSlippage.lastSlippageIsCustom != null) {
          this._lastSlippageIsCustom = savedSlippage.lastSlippageIsCustom;
        }
      });
    }

    autorun(() => {
      this.kvStore.set("ibc-swap-amount-in-out-info", {
        lastAmountInChainId: this._lastAmountInChainId,
        lastAmountInMinimalDenom: this._lastAmountInMinimalDenom,
        lastAmountOutChainId: this._lastAmountOutChainId,
        lastAmountOutMinimalDenom: this._lastAmountOutMinimalDenom,
      });
    });

    autorun(() => {
      this.kvStore.set("ibc-swap-slippage", {
        lastSlippage: this._lastSlippage,
        lastSlippageIsCustom: this._lastSlippageIsCustom,
      });
    });
  }

  getAmountInChainInfo = computedFn((): IChainInfoImpl => {
    if (
      this._lastAmountInChainId &&
      this.chainStore.hasChain(this._lastAmountInChainId) &&
      this.chainStore.isEnabledChain(this._lastAmountInChainId)
    ) {
      return this.chainStore.getChain(this._lastAmountInChainId);
    }

    return this.chainStore.chainInfosInUI[0];
  });

  @action
  setAmountInChainId(chainId: string) {
    this._lastAmountInChainId = chainId;
  }

  getAmountInCurrency = computedFn((): AppCurrency => {
    if (this._lastAmountInMinimalDenom) {
      const currency = this.getAmountInChainInfo().findCurrency(
        this._lastAmountInMinimalDenom
      );
      if (currency) {
        return currency;
      }
    }

    return this.getAmountInChainInfo().currencies[0];
  });

  @action
  setAmountInMinimalDenom(denom: string) {
    this._lastAmountInMinimalDenom = denom;
  }

  getAmountOutChainInfo = computedFn((): IChainInfoImpl => {
    if (
      this._lastAmountOutChainId &&
      this.chainStore.hasChain(this._lastAmountOutChainId)
    ) {
      return this.chainStore.getChain(this._lastAmountOutChainId);
    }

    if (this.getAmountInChainInfo().chainIdentifier !== "osmosis") {
      const findIndex = this.chainStore.chainInfosInUI.findIndex(
        (c) => c.chainIdentifier === "osmosis"
      );
      if (findIndex >= 0) {
        return this.chainStore.chainInfosInUI[findIndex];
      }
    }

    if (this.chainStore.chainInfosInUI.length >= 2) {
      return this.chainStore.chainInfosInUI[1];
    }

    // Enabled된 체인들이 한개만 있을수도 있다는 점을 고려해야한다. 그러므로 chain infos in ui에서 두번째 체인을 찾을 수 없다면
    // 그것과 상관없이 chain infos에서 찾는다.
    const find = this.chainStore.chainInfos.find((chainInfo) => {
      return (
        chainInfo.chainIdentifier !==
        this.getAmountInChainInfo().chainIdentifier
      );
    });
    if (find) {
      return find;
    }
    return this.chainStore.chainInfos[0];
  });

  @action
  setAmountOutChainId(chainId: string) {
    this._lastAmountOutChainId = chainId;
  }

  getAmountOutCurrency = computedFn((): AppCurrency => {
    if (this._lastAmountOutMinimalDenom) {
      return this.getAmountOutChainInfo().forceFindCurrency(
        this._lastAmountOutMinimalDenom
      );
    }

    return this.getAmountOutChainInfo().currencies[0];
  });

  @action
  setAmountOutMinimalDenom(denom: string) {
    this._lastAmountOutMinimalDenom = denom;
  }

  get slippage(): string {
    return this._lastSlippage;
  }

  @action
  setSlippage(slippage: string) {
    this._lastSlippage = slippage;
  }

  get slippageIsCustom(): boolean {
    return this._lastSlippageIsCustom;
  }

  @action
  setSlippageIsCustom(isCustom: boolean) {
    this._lastSlippageIsCustom = isCustom;
  }

  get slippageIsValid(): boolean {
    const trim = this.slippage.trim();

    if (trim === "") {
      return false;
    }

    const num = parseFloat(trim);
    if (Number.isNaN(num)) {
      return false;
    }

    return num >= 0;
  }

  get slippageNum(): number {
    const trim = this.slippage.trim();
    return parseFloat(trim);
  }

  async removeStatesWhenErrorOccurredDuringRending() {
    await this.kvStore.set("ibc-swap-amount-in-out-info", null);
    await this.kvStore.set("ibc-swap-slippage", null);
  }
}
