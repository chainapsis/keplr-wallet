import { action, autorun, makeObservable, observable, runInAction } from "mobx";
import { isServiceWorker, KVStore } from "@keplr-wallet/common";

export class SidePanelService {
  // TODO: 기본값을 false로 수정. 일단은 테스트를 위해서 기본값을 true로 설정.
  @observable
  protected _isEnabled: boolean = true;

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

    // TODO: 웹브라우저에 대한 체크 추가. (chrome.sidePanel이 존재해도 웹브라우저에 따라서 안되는 경우가 있는 듯 하다)
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
