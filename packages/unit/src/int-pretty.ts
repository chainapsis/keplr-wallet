import { Int } from "./int";
import { Dec } from "./decimal";
import { DecUtils } from "./dec-utils";
import { CoinUtils } from "./coin-utils";
import { DeepReadonly } from "utility-types";

export type IntPrettyOptions = {
  precision: number;
  maxDecimals: number;
  trim: boolean;
  shrink: boolean;
  ready: boolean;
  locale: boolean;
};

export class IntPretty {
  protected int: Int;

  protected _options: IntPrettyOptions = {
    precision: 0,
    maxDecimals: 0,
    trim: false,
    shrink: false,
    ready: true,
    locale: true,
  };

  constructor(num: Int | Dec) {
    if (num instanceof Dec) {
      let dec = num;
      let precision = 0;
      for (let i = 0; i < 18; i++) {
        dec = dec.mul(new Dec(10));
        if (dec.equals(new Dec(dec.truncate()))) {
          break;
        }
        precision++;
      }

      const int = num.mulTruncate(DecUtils.getPrecisionDec(precision));
      this.int = int.truncate();
      this._options.precision = precision;
    } else {
      this.int = num;
    }
  }

  get options(): DeepReadonly<IntPrettyOptions> {
    return this._options;
  }

  precision(prec: number): IntPretty {
    const pretty = this.clone();
    pretty._options.precision = prec;
    return pretty;
  }

  maxDecimals(max: number): IntPretty {
    const pretty = this.clone();
    pretty._options.maxDecimals = max;
    return pretty;
  }

  trim(bool: boolean): IntPretty {
    const pretty = this.clone();
    pretty._options.trim = bool;
    return pretty;
  }

  shrink(bool: boolean): IntPretty {
    const pretty = this.clone();
    pretty._options.shrink = bool;
    return pretty;
  }

  locale(locale: boolean): IntPretty {
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
  ready(bool: boolean): IntPretty {
    const pretty = this.clone();
    pretty._options.ready = bool;
    return pretty;
  }

  get isReady(): boolean {
    return this._options.ready;
  }

  add(target: IntPretty): IntPretty {
    const pretty = this.clone();
    // TODO: Handle the precision of target.
    pretty.int = pretty.int.add(target.int);
    return pretty;
  }

  toDec(): Dec {
    let dec = new Dec(this.int);
    if (this._options.precision) {
      dec = dec.quoTruncate(DecUtils.getPrecisionDec(this._options.precision));
    }
    return dec;
  }

  toString(): string {
    const dec = this.toDec();

    let result = "";
    if (!this._options.shrink) {
      result = dec.toString(this._options.maxDecimals, this._options.locale);
    } else {
      result = CoinUtils.shrinkDecimals(
        this.int,
        this._options.precision,
        0,
        this._options.maxDecimals,
        this._options.locale
      );
    }
    if (this._options.trim) {
      result = DecUtils.trim(result);
    }
    return result;
  }

  clone(): IntPretty {
    const pretty = new IntPretty(this.int);
    pretty._options = {
      ...this._options,
    };
    return pretty;
  }
}
