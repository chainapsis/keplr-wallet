import { action, autorun, makeObservable, observable, runInAction } from "mobx";
import { isServiceWorker, KVStore } from "@keplr-wallet/common";

export class SidePanelService {
  @observable
  protected _isEnabled: boolean = false;

  constructor(protected readonly kvStore: KVStore) {
    makeObservable(this);
  }

  async init(): Promise<void> {
    {
      const saved = await this.kvStore.get<boolean>("sidePanel.isEnabled");
      if (saved) {
        runInAction(() => {
          this._isEnabled = saved;
        });
      }

      autorun(() => {
        this.kvStore.set<boolean>("sidePanel.isEnabled", this._isEnabled);
      });

      autorun(() => {
        // XXX: setPanelBehavior() 안에서 this._isEnabled를 사용하고 this._isEnabled는 observable이기 때문에
        //      알아서 반응해서 처리된다는 점을 참고...
        this.setPanelBehavior().catch(console.log);
      });
    }
  }

  @action
  setIsEnabled(isEnabled: boolean): void {
    this._isEnabled = isEnabled;
  }

  getIsEnabled(): boolean {
    if (!this.isSidePanelSupported()) {
      return false;
    }

    return this._isEnabled;
  }

  isSidePanelSupported(): boolean {
    // manifest v3가 아니면 side panel은 작동하지 않음
    if (!isServiceWorker()) {
      return false;
    }

    try {
      // navigator.userAgentData가 experimental이라서 any로 캐스팅해서 사용
      const anyNavigator = navigator as any;
      if ("userAgentData" in anyNavigator) {
        const brandNames: string[] = anyNavigator.userAgentData.brands.map(
          (brand: { brand: string; version: string }) => brand.brand
        );

        // side panel이 API가 있더라도 모든 웹브라우저에서 작동하는게 아니다...
        // 일단 사용 가능한게 확인된 브라우저만 허용
        if (
          !brandNames.includes("Google Chrome") &&
          !brandNames.includes("Microsoft Edge") &&
          !brandNames.includes("Brave")
        ) {
          return false;
        }
      }
    } catch (e) {
      console.log(e);
      return false;
    }

    return (
      typeof chrome !== "undefined" && typeof chrome.sidePanel !== "undefined"
    );
  }

  protected async setPanelBehavior(): Promise<void> {
    if (this._isEnabled) {
      if (this.isSidePanelSupported()) {
        await chrome.sidePanel.setPanelBehavior({
          openPanelOnActionClick: true,
        });
      }
    } else {
      if (this.isSidePanelSupported()) {
        await chrome.sidePanel.setPanelBehavior({
          openPanelOnActionClick: false,
        });
      }
    }
  }
}
