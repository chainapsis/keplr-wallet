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
  protected dec: Dec;
  protected decPrecision: number = 0;

  protected _options: IntPrettyOptions = {
    precision: 0,
    maxDecimals: 0,
    trim: false,
    shrink: false,
    ready: true,
    locale: true,
  };

  constructor(num: Dec | { toDec(): Dec }) {
    if ("toDec" in num) {
      num = num.toDec();
    }

    if (num.equals(new Dec(0))) {
      this.dec = num;
      return;
    }

    let dec = num;
    let decPrecision = 0;
    for (let i = 0; i < 18; i++) {
      if (
        !dec.truncate().equals(new Int(0)) &&
        dec.equals(new Dec(dec.truncate()))
      ) {
        break;
      }
      dec = dec.mul(new Dec(10));
      decPrecision++;
    }

    this.dec = num;
    this.decPrecision = decPrecision;
    this._options.precision = decPrecision;
    this._options.maxDecimals = decPrecision;
  }

  get options(): DeepReadonly<IntPrettyOptions> {
    return this._options;
  }

  precision(prec: number): IntPretty {
    if (prec < -18) {
      throw new Error("Too little precision");
    }
    if (prec > 18) {
      throw new Error("Too much precision");
    }

    const pretty = this.clone();
    pretty._options.precision = prec;
    return pretty;
  }

  increasePrecision(delta: number): IntPretty {
    return this.precision(this._options.precision + delta);
  }

  decreasePrecision(delta: number): IntPretty {
    return this.precision(this._options.precision - delta);
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

  add(target: Dec | { toDec(): Dec }): IntPretty {
    if (!(target instanceof Dec)) {
      target = target.toDec();
    }

    const pretty = new IntPretty(this.toDec().add(target));
    pretty._options = {
      ...this._options,
      // Precision must not be changed.
      precision: pretty._options.precision,
    };
    return pretty;
  }

  sub(target: Dec | { toDec(): Dec }): IntPretty {
    if (!(target instanceof Dec)) {
      target = target.toDec();
    }

    const pretty = new IntPretty(this.toDec().sub(target));
    pretty._options = {
      ...this._options,
      // Precision must not be changed.
      precision: pretty._options.precision,
    };
    return pretty;
  }

  mul(target: Dec | { toDec(): Dec }): IntPretty {
    if (!(target instanceof Dec)) {
      target = target.toDec();
    }

    const pretty = new IntPretty(this.toDec().mul(target));
    pretty._options = {
      ...this._options,
      // Precision must not be changed.
      precision: pretty._options.precision,
    };
    return pretty;
  }

  quo(target: Dec | { toDec(): Dec }): IntPretty {
    if (!(target instanceof Dec)) {
      target = target.toDec();
    }

    const pretty = new IntPretty(this.toDec().quo(target));
    pretty._options = {
      ...this._options,
      // Precision must not be changed.
      precision: pretty._options.precision,
    };
    return pretty;
  }

  toDec(): Dec {
    let dec = this.dec;
    const deltaPrecision = this.decPrecision - this._options.precision;
    if (deltaPrecision !== 0) {
      dec = dec.mulTruncate(DecUtils.getPrecisionDec(deltaPrecision));
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
        dec,
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
    const pretty = new IntPretty(this.dec);
    pretty.dec = this.dec;
    pretty.decPrecision = this.decPrecision;
    pretty._options = {
      ...this._options,
    };
    return pretty;
  }
}
