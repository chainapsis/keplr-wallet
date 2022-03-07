import { IntPretty, IntPrettyOptions } from "./int-pretty";
import { Dec } from "./decimal";
import { FiatCurrency } from "@keplr-wallet/types";
import { DeepReadonly } from "utility-types";
import { DecUtils } from "./dec-utils";
import bigInteger from "big-integer";

export type PricePrettyOptions = {
  separator: string;
  upperCase: boolean;
  lowerCase: boolean;
  locale: string;
};

export class PricePretty {
  protected intPretty: IntPretty;

  protected _options: PricePrettyOptions = {
    separator: "",
    upperCase: false,
    lowerCase: false,
    locale: "en-US",
  };

  constructor(
    protected _fiatCurrency: FiatCurrency,
    protected amount: Dec | { toDec(): Dec } | bigInteger.BigNumber
  ) {
    this.intPretty = new IntPretty(amount)
      .maxDecimals(_fiatCurrency.maxDecimals)
      .shrink(true)
      .trim(true)
      .locale(false)
      .inequalitySymbol(true);

    this._options.locale = _fiatCurrency.locale;
  }

  get options(): DeepReadonly<
    Omit<IntPrettyOptions, "locale"> & PricePrettyOptions
  > {
    return {
      ...this.intPretty.options,
      ...this._options,
    };
  }

  get symbol(): string {
    return this._fiatCurrency.symbol;
  }

  get fiatCurrency(): FiatCurrency {
    return this._fiatCurrency;
  }

  separator(str: string): PricePretty {
    const pretty = this.clone();
    pretty._options.separator = str;
    return pretty;
  }

  upperCase(bool: boolean): PricePretty {
    const pretty = this.clone();
    pretty._options.upperCase = bool;
    pretty._options.lowerCase = !bool;
    return pretty;
  }

  lowerCase(bool: boolean): PricePretty {
    const pretty = this.clone();
    pretty._options.lowerCase = bool;
    pretty._options.upperCase = !bool;
    return pretty;
  }

  moveDecimalPointLeft(delta: number): PricePretty {
    const pretty = this.clone();
    pretty.intPretty = pretty.intPretty.moveDecimalPointLeft(delta);
    return pretty;
  }

  moveDecimalPointRight(delta: number): PricePretty {
    const pretty = this.clone();
    pretty.intPretty = pretty.intPretty.moveDecimalPointRight(delta);
    return pretty;
  }

  /**
   * @deprecated Use`moveDecimalPointLeft`
   */
  increasePrecision(delta: number): PricePretty {
    return this.moveDecimalPointLeft(delta);
  }

  /**
   * @deprecated Use`moveDecimalPointRight`
   */
  decreasePrecision(delta: number): PricePretty {
    return this.moveDecimalPointRight(delta);
  }

  maxDecimals(max: number): PricePretty {
    const pretty = this.clone();
    pretty.intPretty = pretty.intPretty.maxDecimals(max);
    return pretty;
  }

  inequalitySymbol(bool: boolean): PricePretty {
    const pretty = this.clone();
    pretty.intPretty = pretty.intPretty.inequalitySymbol(bool);
    return pretty;
  }

  inequalitySymbolSeparator(str: string): PricePretty {
    const pretty = this.clone();
    pretty.intPretty = pretty.intPretty.inequalitySymbolSeparator(str);
    return pretty;
  }

  trim(bool: boolean): PricePretty {
    const pretty = this.clone();
    pretty.intPretty = pretty.intPretty.trim(bool);
    return pretty;
  }

  shrink(bool: boolean): PricePretty {
    const pretty = this.clone();
    pretty.intPretty = pretty.intPretty.shrink(bool);
    return pretty;
  }

  locale(locale: string): PricePretty {
    const pretty = this.clone();
    pretty._options.locale = locale;
    return pretty;
  }

  /**
   * Ready indicates the actual value is ready to show the users.
   * Even if the ready option is false, it expects that the value can be shown to users (probably as 0).
   * The method that returns prettied value may return `undefined` or `null` if the value is not ready.
   * But, alternatively, it can return the 0 value that can be shown the users anyway, but indicates that the value is not ready.
   * @param bool
   */
  ready(bool: boolean): PricePretty {
    const pretty = this.clone();
    pretty.intPretty = pretty.intPretty.ready(bool);
    return pretty;
  }

  get isReady(): boolean {
    return this.intPretty.isReady;
  }

  add(target: Dec | { toDec(): Dec }): PricePretty {
    const pretty = this.clone();
    pretty.intPretty = pretty.intPretty.add(target);
    return pretty;
  }

  sub(target: Dec | { toDec(): Dec }): PricePretty {
    const pretty = this.clone();
    pretty.intPretty = pretty.intPretty.sub(target);
    return pretty;
  }

  mul(target: Dec | { toDec(): Dec }): PricePretty {
    const pretty = this.clone();
    pretty.intPretty = pretty.intPretty.mul(target);
    return pretty;
  }

  quo(target: Dec | { toDec(): Dec }): PricePretty {
    const pretty = this.clone();
    pretty.intPretty = pretty.intPretty.quo(target);
    return pretty;
  }

  toDec(): Dec {
    return this.intPretty.toDec();
  }

  toString(): string {
    let symbol = this.symbol;
    if (this._options.upperCase) {
      symbol = symbol.toUpperCase();
    }
    if (this._options.lowerCase) {
      symbol = symbol.toLowerCase();
    }

    const dec = this.toDec();
    const options = this.options;

    if (
      options.inequalitySymbol &&
      !dec.isZero() &&
      dec.abs().lt(DecUtils.getTenExponentN(-options.maxDecimals))
    ) {
      return this.intPretty.toStringWithSymbols(
        `${symbol}${this._options.separator}`,
        ""
      );
    }

    let localeString = parseFloat(this.intPretty.toString()).toLocaleString(
      options.locale,
      {
        maximumFractionDigits: options.maxDecimals,
      }
    );

    const isNeg = localeString.charAt(0) === "-";
    if (isNeg) {
      localeString = localeString.slice(1);
    }

    return `${isNeg ? "-" : ""}${symbol}${
      this._options.separator
    }${localeString}`;
  }

  clone(): PricePretty {
    const pretty = new PricePretty(this._fiatCurrency, this.amount);
    pretty._options = {
      ...this._options,
    };
    pretty.intPretty = this.intPretty.clone();
    return pretty;
  }
}
