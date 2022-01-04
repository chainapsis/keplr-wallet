import { IntPretty, IntPrettyOptions } from "./int-pretty";
import { Dec } from "./decimal";
import { DeepReadonly } from "utility-types";
import bigInteger from "big-integer";

export type RatePrettyOptions = {
  separator: string;
  symbol: string;
};

/**
 * RatePretty treats `Dec` in rate form for easy calculation, and displays it as a percentage to the user by using toString().
 * By default, if the value is less than maxDeciamls, it is displayed using an inequality sign (Ex. < 0.001%)
 */
export class RatePretty {
  protected intPretty: IntPretty;

  protected _options: RatePrettyOptions = {
    separator: "",
    symbol: "%",
  };

  constructor(protected amount: Dec | { toDec(): Dec } | bigInteger.BigNumber) {
    this.intPretty = new IntPretty(amount);

    this.intPretty = this.intPretty
      .maxDecimals(3)
      .shrink(false)
      .trim(true)
      .locale(true)
      .inequalitySymbol(true);
  }

  get options(): DeepReadonly<
    Omit<IntPrettyOptions, "locale"> & RatePrettyOptions
  > {
    return {
      ...this.intPretty.options,
      ...this._options,
    };
  }

  separator(str: string): RatePretty {
    const pretty = this.clone();
    pretty._options.separator = str;
    return pretty;
  }

  symbol(str: string): RatePretty {
    const pretty = this.clone();
    pretty._options.symbol = str;
    return pretty;
  }

  moveDecimalPointLeft(delta: number): RatePretty {
    const pretty = this.clone();
    pretty.intPretty = pretty.intPretty.moveDecimalPointLeft(delta);
    return pretty;
  }

  moveDecimalPointRight(delta: number): RatePretty {
    const pretty = this.clone();
    pretty.intPretty = pretty.intPretty.moveDecimalPointRight(delta);
    return pretty;
  }

  maxDecimals(max: number): RatePretty {
    const pretty = this.clone();
    pretty.intPretty = pretty.intPretty.maxDecimals(max);
    return pretty;
  }

  inequalitySymbol(bool: boolean): RatePretty {
    const pretty = this.clone();
    pretty.intPretty = pretty.intPretty.inequalitySymbol(bool);
    return pretty;
  }

  inequalitySymbolSeparator(str: string): RatePretty {
    const pretty = this.clone();
    pretty.intPretty = pretty.intPretty.inequalitySymbolSeparator(str);
    return pretty;
  }

  trim(bool: boolean): RatePretty {
    const pretty = this.clone();
    pretty.intPretty = pretty.intPretty.trim(bool);
    return pretty;
  }

  shrink(bool: boolean): RatePretty {
    const pretty = this.clone();
    pretty.intPretty = pretty.intPretty.shrink(bool);
    return pretty;
  }

  locale(locale: boolean): RatePretty {
    const pretty = this.clone();
    pretty.intPretty = pretty.intPretty.locale(locale);
    return pretty;
  }

  /**
   * Ready indicates the actual value is ready to show the users.
   * Even if the ready option is false, it expects that the value can be shown to users (probably as 0).
   * The method that returns prettied value may return `undefined` or `null` if the value is not ready.
   * But, alternatively, it can return the 0 value that can be shown the users anyway, but indicates that the value is not ready.
   * @param bool
   */
  ready(bool: boolean): RatePretty {
    const pretty = this.clone();
    pretty.intPretty = pretty.intPretty.ready(bool);
    return pretty;
  }

  get isReady(): boolean {
    return this.intPretty.isReady;
  }

  add(target: Dec | { toDec(): Dec }): RatePretty {
    const pretty = this.clone();
    pretty.intPretty = pretty.intPretty.add(target);
    return pretty;
  }

  sub(target: Dec | { toDec(): Dec }): RatePretty {
    const pretty = this.clone();
    pretty.intPretty = pretty.intPretty.sub(target);
    return pretty;
  }

  mul(target: Dec | { toDec(): Dec }): RatePretty {
    const pretty = this.clone();
    pretty.intPretty = pretty.intPretty.mul(target);
    return pretty;
  }

  quo(target: Dec | { toDec(): Dec }): RatePretty {
    const pretty = this.clone();
    pretty.intPretty = pretty.intPretty.quo(target);
    return pretty;
  }

  toDec(): Dec {
    return this.intPretty.toDec();
  }

  toString(): string {
    return this.intPretty
      .moveDecimalPointRight(2)
      .toStringWithSymbols(
        "",
        `${this._options.separator}${this._options.symbol}`
      );
  }

  clone(): RatePretty {
    const pretty = new RatePretty(this.amount);
    pretty._options = {
      ...this._options,
    };
    pretty.intPretty = this.intPretty.clone();
    return pretty;
  }
}
