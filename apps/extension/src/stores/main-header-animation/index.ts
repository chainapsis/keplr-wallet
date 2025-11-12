import { action, makeObservable, observable } from "mobx";

export type MainHeaderPriceAnimationTrigger = "not-triggered" | "show" | "hide";

export class MainHeaderAnimationStore {
  @observable
  public mainPageTotalPriceVisible: boolean = true;

  @observable
  public triggerMainHeaderPriceAnimation: MainHeaderPriceAnimationTrigger =
    "not-triggered";

  constructor() {
    makeObservable(this);
  }

  @action
  public setMainPageTotalPriceVisible(value: boolean): void {
    this.mainPageTotalPriceVisible = value;
  }

  @action
  public triggerShowForMainHeaderPrice(): void {
    this.triggerMainHeaderPriceAnimation = "show";
  }

  @action
  public triggerHideForMainHeaderPrice(): void {
    this.triggerMainHeaderPriceAnimation = "hide";
  }

  @action
  public resetTriggerForMainHeaderPrice(): void {
    if (this.triggerMainHeaderPriceAnimation === "not-triggered") {
      return;
    }

    this.triggerMainHeaderPriceAnimation = "not-triggered";
  }
}
