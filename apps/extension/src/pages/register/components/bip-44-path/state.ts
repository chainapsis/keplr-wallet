import { action, makeObservable, observable } from "mobx";

export class BIP44PathState {
  @observable
  protected _accountText: string = "0";
  @observable
  protected _changeText: string = "0";
  @observable
  protected _addressIndexText: string = "0";

  @observable
  protected _isLedger: boolean = false;

  constructor(isLedger?: boolean) {
    makeObservable(this);

    if (isLedger) {
      this._isLedger = true;
    }
  }

  @action
  setIsLedger(isLedger: boolean) {
    this._isLedger = isLedger;
  }

  get accountText(): string {
    return this._accountText;
  }

  get changeText(): string {
    return this._changeText;
  }

  get addressIndexText(): string {
    return this._addressIndexText;
  }

  @action
  reset() {
    this._accountText = "0";
    this._changeText = "0";
    this._addressIndexText = "0";
  }

  @action
  setAccountText(text: string) {
    this._accountText = text.trim();
  }

  @action
  setChangeText(text: string) {
    text = text.trim();

    if (text !== "") {
      const num = parseInt(text);
      if (Number.isNaN(num) || num < 0 || num > 1) {
        return;
      }
    }

    this._changeText = text;
  }

  @action
  setAddressIndexText(text: string) {
    this._addressIndexText = text.trim();
  }

  protected validatePositiveOrZeroText(text: string): number {
    const num = parseInt(text);
    if (Number.isNaN(num)) {
      return -1;
    }
    if (num.toString() !== text) {
      return -1;
    }
    if (num < 0) {
      return -1;
    }

    return num;
  }

  isAccountValid(): boolean {
    if (!this.accountText) {
      return false;
    }

    const validated = this.validatePositiveOrZeroText(this.accountText);
    if (validated < 0) {
      return false;
    }
    if (this._isLedger) {
      if (validated > 100) {
        return false;
      }
    } else {
      if (validated > 2147483647) {
        return false;
      }
    }
    return true;
  }

  isChangeValid(): boolean {
    if (!this.changeText) {
      return false;
    }

    const validated = this.validatePositiveOrZeroText(this.changeText);
    if (validated < 0) {
      return false;
    }
    if (validated > 1) {
      return false;
    }
    return true;
  }

  isAddressIndexValid(): boolean {
    if (!this.addressIndexText) {
      return false;
    }

    const validated = this.validatePositiveOrZeroText(this.addressIndexText);
    if (validated < 0) {
      return false;
    }
    if (this._isLedger) {
      if (validated > 100) {
        return false;
      }
    } else {
      if (validated > 4294967295) {
        return false;
      }
    }
    return true;
  }

  isValid(): boolean {
    return (
      this.isAccountValid() &&
      this.isChangeValid() &&
      this.isAddressIndexValid()
    );
  }

  getPath(): {
    account: number;
    change: number;
    addressIndex: number;
  } {
    if (!this.isValid()) {
      throw new Error("BIP 44 state is not valid");
    }

    return {
      account: parseInt(this.accountText),
      change: parseInt(this.changeText),
      addressIndex: parseInt(this.addressIndexText),
    };
  }
}
