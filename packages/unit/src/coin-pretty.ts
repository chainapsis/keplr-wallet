import { IntPretty, IntPrettyOptions } from "./int-pretty";
import { Dec } from "./decimal";
import { AppCurrency } from "@keplr-wallet/types";
import { DeepReadonly } from "utility-types";
import { DecUtils } from "./dec-utils";
import bigInteger from "big-integer";

export type CoinPrettyOptions = {
  separator: string;
  upperCase: boolean;
  lowerCase: boolean;
  hideDenom: boolean;
  hideAmount: boolean;
  hideIBCMetadata: boolean;
  showRawCoinDenom: boolean;
  maxCoinDenomLength: number;
};

export class CoinPretty {
  static makeCoinDenomPretty(coinDenom: string) {
    const isHexString = /^(?:0[xX][0-9a-fA-F]+|[0-9][0-9a-fA-F]*)$/.test(
      coinDenom
    );
    if (isHexString) {
      const buf = Buffer.from(coinDenom.replace(/^0x/, ""), "hex");

      const nullIndex = buf.indexOf(0);
      const end = nullIndex === -1 ? buf.length : nullIndex;

      return buf
        .toString("utf8", 0, end)
        .replace(/\u0000+/g, "")
        .trim();
    }

    return coinDenom.replace(/\u0000+/g, "").trim();
  }

  protected intPretty: IntPretty;

  protected _options: CoinPrettyOptions = {
    separator: " ",
    upperCase: false,
    lowerCase: false,
    hideDenom: false,
    hideAmount: false,
    showRawCoinDenom: false,
    hideIBCMetadata: false,
    // default max length is 20
    maxCoinDenomLength: 20,
  };

  constructor(
    protected _currency: AppCurrency,
    amount: Dec | { toDec(): Dec } | bigInteger.BigNumber
  ) {
    if (typeof amount === "object" && "toDec" in amount) {
      amount = amount.toDec();
    } else if (!(amount instanceof Dec)) {
      amount = new Dec(amount);
    }

    this.intPretty = new IntPretty(
      amount.quoTruncate(
        DecUtils.getTenExponentNInPrecisionRange(_currency.coinDecimals)
      )
    ).maxDecimals(_currency.coinDecimals);
  }

  get options(): DeepReadonly<IntPrettyOptions & CoinPrettyOptions> {
    return {
      ...this._options,
      ...this.intPretty.options,
    };
  }

  get denom(): string {
    return this.currency.coinDenom;
  }

  get currency(): AppCurrency {
    return this._currency;
  }

  setCurrency(currency: AppCurrency): CoinPretty {
    const pretty = this.clone();
    pretty.intPretty = this.intPretty.moveDecimalPointRight(
      this._currency.coinDecimals - currency.coinDecimals
    );
    pretty._currency = currency;
    return pretty;
  }

  separator(str: string): CoinPretty {
    const pretty = this.clone();
    pretty._options.separator = str;
    return pretty;
  }

  upperCase(bool: boolean): CoinPretty {
    const pretty = this.clone();
    pretty._options.upperCase = bool;
    pretty._options.lowerCase = !bool;
    return pretty;
  }

  lowerCase(bool: boolean): CoinPretty {
    const pretty = this.clone();
    pretty._options.lowerCase = bool;
    pretty._options.upperCase = !bool;
    return pretty;
  }

  hideDenom(bool: boolean): CoinPretty {
    const pretty = this.clone();
    pretty._options.hideDenom = bool;
    return pretty;
  }

  hideAmount(bool: boolean): CoinPretty {
    const pretty = this.clone();
    pretty._options.hideAmount = bool;
    return pretty;
  }

  hideIBCMetadata(bool: boolean): CoinPretty {
    const pretty = this.clone();
    pretty._options.hideIBCMetadata = bool;
    return pretty;
  }

  showRawCoinDenom(bool: boolean): CoinPretty {
    const pretty = this.clone();
    pretty._options.showRawCoinDenom = bool;
    return pretty;
  }

  moveDecimalPointLeft(delta: number): CoinPretty {
    const pretty = this.clone();
    pretty.intPretty = pretty.intPretty.moveDecimalPointLeft(delta);
    return pretty;
  }

  moveDecimalPointRight(delta: number): CoinPretty {
    const pretty = this.clone();
    pretty.intPretty = pretty.intPretty.moveDecimalPointRight(delta);
    return pretty;
  }

  /**
   * @deprecated Use`moveDecimalPointLeft`
   */
  increasePrecision(delta: number): CoinPretty {
    return this.moveDecimalPointLeft(delta);
  }

  /**
   * @deprecated Use`moveDecimalPointRight`
   */
  decreasePrecision(delta: number): CoinPretty {
    return this.moveDecimalPointRight(delta);
  }

  maxDecimals(max: number): CoinPretty {
    const pretty = this.clone();
    pretty.intPretty = pretty.intPretty.maxDecimals(max);
    return pretty;
  }

  inequalitySymbol(bool: boolean): CoinPretty {
    const pretty = this.clone();
    pretty.intPretty = pretty.intPretty.inequalitySymbol(bool);
    return pretty;
  }

  inequalitySymbolSeparator(str: string): CoinPretty {
    const pretty = this.clone();
    pretty.intPretty = pretty.intPretty.inequalitySymbolSeparator(str);
    return pretty;
  }

  trim(bool: boolean): CoinPretty {
    const pretty = this.clone();
    pretty.intPretty = pretty.intPretty.trim(bool);
    return pretty;
  }

  shrink(bool: boolean): CoinPretty {
    const pretty = this.clone();
    pretty.intPretty = pretty.intPretty.shrink(bool);
    return pretty;
  }

  locale(locale: boolean): CoinPretty {
    const pretty = this.clone();
    pretty.intPretty = pretty.intPretty.locale(locale);
    return pretty;
  }

  roundTo(roundTo: number | undefined): CoinPretty {
    const pretty = this.clone();
    pretty.intPretty = pretty.intPretty.roundTo(roundTo);
    return pretty;
  }

  /**
   * Ready indicates the actual value is ready to show the users.
   * Even if the ready option is false, it expects that the value can be shown to users (probably as 0).
   * The method that returns prettied value may return `undefined` or `null` if the value is not ready.
   * But, alternatively, it can return the 0 value that can be shown the users anyway, but indicates that the value is not ready.
   * @param bool
   */
  ready(bool: boolean): CoinPretty {
    const pretty = this.clone();
    pretty.intPretty = pretty.intPretty.ready(bool);
    return pretty;
  }

  get isReady(): boolean {
    return this.intPretty.isReady;
  }

  add(target: Dec | { toDec(): Dec } | CoinPretty): CoinPretty {
    const isCoinPretty = target instanceof CoinPretty;
    if (isCoinPretty) {
      // If target is `CoinPretty` and it has different denom, do nothing.
      if (
        "currency" in target &&
        this.currency.coinMinimalDenom !== target.currency.coinMinimalDenom
      ) {
        return this.clone();
      }
    }

    if ("toDec" in target) {
      target = target.toDec();
    }

    const pretty = this.clone();
    pretty.intPretty = pretty.intPretty.add(
      isCoinPretty
        ? target
        : target.mul(
            DecUtils.getTenExponentNInPrecisionRange(
              -this._currency.coinDecimals
            )
          )
    );
    return pretty;
  }

  addDifferentDenoms(target: CoinPretty): CoinPretty {
    const pretty = this.clone();
    pretty.intPretty = pretty.intPretty.add(target);
    return pretty;
  }

  sub(target: Dec | { toDec(): Dec } | CoinPretty): CoinPretty {
    const isCoinPretty = target instanceof CoinPretty;
    if (isCoinPretty) {
      // If target is `CoinPretty` and it has different denom, do nothing.
      if (
        "currency" in target &&
        this.currency.coinMinimalDenom !== target.currency.coinMinimalDenom
      ) {
        return this.clone();
      }
    }

    if ("toDec" in target) {
      target = target.toDec();
    }

    const pretty = this.clone();
    pretty.intPretty = pretty.intPretty.sub(
      isCoinPretty
        ? target
        : target.mul(
            DecUtils.getTenExponentNInPrecisionRange(
              -this._currency.coinDecimals
            )
          )
    );
    return pretty;
  }

  mul(target: Dec | { toDec(): Dec }): CoinPretty {
    const pretty = this.clone();
    pretty.intPretty = pretty.intPretty.mul(target);
    return pretty;
  }

  quo(target: Dec | { toDec(): Dec }): CoinPretty {
    const pretty = this.clone();
    pretty.intPretty = pretty.intPretty.quo(target);
    return pretty;
  }

  toDec(): Dec {
    return this.intPretty.toDec();
  }

  toCoin(): {
    denom: string;
    amount: string;
  } {
    const amount = this.toDec()
      .mulTruncate(
        DecUtils.getTenExponentNInPrecisionRange(this.currency.coinDecimals)
      )
      .truncate();

    return {
      denom: this.currency.coinMinimalDenom,
      amount: amount.toString(),
    };
  }

  maxCoinDenomLength(maxLength: number): CoinPretty {
    const pretty = this.clone();
    pretty._options.maxCoinDenomLength = maxLength;
    return pretty;
  }

  toString(): string {
    let denom = this.denom;
    if (
      this._options.hideIBCMetadata &&
      "originCurrency" in this.currency &&
      this.currency.originCurrency
    ) {
      denom = this.currency.originCurrency.coinDenom;
    }
    if (this._options.upperCase) {
      denom = denom.toUpperCase();
    }
    if (this._options.lowerCase) {
      denom = denom.toLowerCase();
    }

    if (!this._options.showRawCoinDenom) {
      denom = CoinPretty.makeCoinDenomPretty(denom);
    }

    if (!this._options.hideIBCMetadata) {
      if (
        "originCurrency" in this.currency &&
        this.currency.originCurrency &&
        this.currency.originCurrency.coinDenom.length >
          this._options.maxCoinDenomLength
      ) {
        denom = denom.replace(
          this.currency.originCurrency.coinDenom,
          `${this.currency.originCurrency.coinDenom.slice(
            0,
            this._options.maxCoinDenomLength
          )}...`
        );
      }
    } else {
      if (denom.length > this._options.maxCoinDenomLength) {
        denom = `${denom.slice(0, this._options.maxCoinDenomLength)}...`;
      }
    }

    let separator = this._options.separator;

    if (this._options.hideDenom) {
      denom = "";
      separator = "";
    }

    if (this._options.hideAmount) {
      return denom;
    }

    return this.intPretty.toStringWithSymbols("", `${separator}${denom}`);
  }

  clone(): CoinPretty {
    const pretty = new CoinPretty(this._currency, 0);
    pretty._options = {
      ...this._options,
    };
    pretty.intPretty = this.intPretty.clone();
    return pretty;
  }
}
