import bigInteger from "big-integer";
import { Int } from "./int";
import { CoinUtils } from "./coin-utils";
import {
  exponentDecStringToDecString,
  isExponentDecString,
  isValidDecimalString,
} from "./etc";

export class Dec {
  public static readonly precision = 18;
  // Bytes required to represent the above precision is 18.
  // Ceiling[Log2[999 999 999 999 999 999]]
  protected static readonly decimalPrecisionBits = 60;
  // Max bit length for `Dec` is 256 + 60(decimalPrecisionBits)
  // The int in the `Dec` is handled as integer assuming that it has 18 precision.
  // (2 ** (256 + 60) - 1)
  protected static readonly maxDec = bigInteger(
    "133499189745056880149688856635597007162669032647290798121690100488888732861290034376435130433535"
  );

  protected static readonly precisionMultipliers: {
    [key: string]: bigInteger.BigInteger | undefined;
  } = {};
  protected static calcPrecisionMultiplier(
    prec: number
  ): bigInteger.BigInteger {
    if (prec < 0) {
      throw new Error("Invalid prec");
    }
    if (prec > Dec.precision) {
      throw new Error("Too much precision");
    }
    if (Dec.precisionMultipliers[prec.toString()]) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return Dec.precisionMultipliers[prec.toString()]!;
    }

    const zerosToAdd = Dec.precision - prec;
    const multiplier = bigInteger(10).pow(zerosToAdd);
    Dec.precisionMultipliers[prec.toString()] = multiplier;
    return multiplier;
  }

  protected static reduceDecimalsFromString(
    str: string
  ): { res: string; isDownToZero: boolean } {
    const decimalPointIndex = str.indexOf(".");
    if (decimalPointIndex < 0) {
      return {
        res: str,
        isDownToZero: false,
      };
    }

    const exceededDecimals = str.length - 1 - decimalPointIndex - Dec.precision;
    if (exceededDecimals <= 0) {
      return {
        res: str,
        isDownToZero: false,
      };
    }

    const res = str.slice(0, str.length - exceededDecimals);
    return {
      res,
      isDownToZero: /^[0.]*$/.test(res),
    };
  }

  protected int: bigInteger.BigInteger;

  /**
   * Create a new Dec from integer with decimal place at prec
   * @param int - Parse a number | bigInteger | string into a Dec.
   * If int is string and contains dot(.), prec is ignored and automatically calculated.
   * @param prec - Precision
   */
  constructor(int: bigInteger.BigNumber | Int, prec: number = 0) {
    if (typeof int === "number") {
      int = int.toString();
    }

    if (typeof int === "string") {
      if (int.length === 0) {
        throw new Error("empty string");
      }
      if (!isValidDecimalString(int)) {
        if (isExponentDecString(int)) {
          int = exponentDecStringToDecString(int);
        } else {
          throw new Error(`invalid decimal: ${int}`);
        }
      }
      // Even if an input with more than 18 decimals, it does not throw an error and ignores the rest.
      const reduced = Dec.reduceDecimalsFromString(int);
      if (reduced.isDownToZero) {
        // However, as a result, if the input becomes 0, a problem may occur in mul or quo. In this case, print a warning.
        console.log(
          `WARNING: Got ${int}. Dec can only handle up to 18 decimals. However, since the decimal point of the input exceeds 18 digits, the remainder is discarded. As a result, input becomes 0.`
        );
      }
      int = reduced.res;
      if (int.indexOf(".") >= 0) {
        prec = int.length - int.indexOf(".") - 1;
        int = int.replace(".", "");
      }
      this.int = bigInteger(int);
    } else if (int instanceof Int) {
      this.int = bigInteger(int.toString());
    } else if (typeof int === "bigint") {
      this.int = bigInteger(int);
    } else {
      this.int = bigInteger(int);
    }

    this.int = this.int.multiply(Dec.calcPrecisionMultiplier(prec));

    this.checkBitLen();
  }

  protected checkBitLen(): void {
    if (this.int.abs().gt(Dec.maxDec)) {
      throw new Error(`Integer out of range ${this.int.toString()}`);
    }
  }

  public isZero(): boolean {
    return this.int.eq(bigInteger(0));
  }

  public isNegative(): boolean {
    return this.int.isNegative();
  }

  public isPositive(): boolean {
    return this.int.isPositive();
  }

  public equals(d2: Dec): boolean {
    return this.int.eq(d2.int);
  }

  /**
   * Alias for the greater method.
   */
  public gt(d2: Dec): boolean {
    return this.int.gt(d2.int);
  }

  /**
   * Alias for the greaterOrEquals method.
   */
  public gte(d2: Dec): boolean {
    return this.int.geq(d2.int);
  }

  /**
   * Alias for the lesser method.
   */
  public lt(d2: Dec): boolean {
    return this.int.lt(d2.int);
  }

  /**
   * Alias for the lesserOrEquals method.
   */
  public lte(d2: Dec): boolean {
    return this.int.leq(d2.int);
  }

  /**
   * reverse the decimal sign.
   */
  public neg(): Dec {
    return new Dec(this.int.negate(), Dec.precision);
  }

  /**
   * Returns the absolute value of a decimals.
   */
  public abs(): Dec {
    return new Dec(this.int.abs(), Dec.precision);
  }

  public add(d2: Dec): Dec {
    return new Dec(this.int.add(d2.int), Dec.precision);
  }

  public sub(d2: Dec): Dec {
    return new Dec(this.int.subtract(d2.int), Dec.precision);
  }

  public pow(n: Int): Dec {
    if (n.isZero()) {
      return new Dec(1);
    }

    if (n.isNegative()) {
      return new Dec(1).quo(this.pow(n.abs()));
    }

    let base = new Dec(this.int, Dec.precision);
    let tmp = new Dec(1);

    for (let i = n; i.gt(new Int(1)); i = i.div(new Int(2))) {
      if (!i.mod(new Int(2)).isZero()) {
        tmp = tmp.mul(base);
      }
      base = base.mul(base);
    }

    return base.mul(tmp);
  }

  public mul(d2: Dec): Dec {
    return new Dec(this.mulRaw(d2).chopPrecisionAndRound(), Dec.precision);
  }

  public mulTruncate(d2: Dec): Dec {
    return new Dec(this.mulRaw(d2).chopPrecisionAndTruncate(), Dec.precision);
  }

  protected mulRaw(d2: Dec): Dec {
    return new Dec(this.int.multiply(d2.int), Dec.precision);
  }

  public quo(d2: Dec): Dec {
    return new Dec(this.quoRaw(d2).chopPrecisionAndRound(), Dec.precision);
  }

  public quoTruncate(d2: Dec): Dec {
    return new Dec(this.quoRaw(d2).chopPrecisionAndTruncate(), Dec.precision);
  }

  public quoRoundUp(d2: Dec): Dec {
    return new Dec(this.quoRaw(d2).chopPrecisionAndRoundUp(), Dec.precision);
  }

  protected quoRaw(d2: Dec): Dec {
    const precision = Dec.calcPrecisionMultiplier(0);

    // multiply precision twice
    const mul = this.int.multiply(precision).multiply(precision);
    return new Dec(mul.divide(d2.int), Dec.precision);
  }

  public isInteger(): boolean {
    const precision = Dec.calcPrecisionMultiplier(0);
    return this.int.remainder(precision).equals(bigInteger(0));
  }

  /**
   * Remove a Precision amount of rightmost digits and perform bankers rounding
   * on the remainder (gaussian rounding) on the digits which have been removed.
   */
  protected chopPrecisionAndRound(): bigInteger.BigInteger {
    // Remove the negative and add it back when returning
    if (this.isNegative()) {
      const absoulteDec = this.abs();
      const choped = absoulteDec.chopPrecisionAndRound();
      return choped.negate();
    }

    const precision = Dec.calcPrecisionMultiplier(0);
    const fivePrecision = precision.divide(bigInteger(2));

    // Get the truncated quotient and remainder
    const { quotient, remainder } = this.int.divmod(precision);

    // If remainder is zero
    if (remainder.equals(bigInteger(0))) {
      return quotient;
    }

    if (remainder.lt(fivePrecision)) {
      return quotient;
    } else if (remainder.gt(fivePrecision)) {
      return quotient.add(bigInteger(1));
    } else {
      // always round to an even number
      if (quotient.divide(bigInteger(2)).equals(bigInteger(0))) {
        return quotient;
      } else {
        return quotient.add(bigInteger(1));
      }
    }
  }

  protected chopPrecisionAndRoundUp(): bigInteger.BigInteger {
    // Remove the negative and add it back when returning
    if (this.isNegative()) {
      const absoulteDec = this.abs();
      // truncate since d is negative...
      const choped = absoulteDec.chopPrecisionAndTruncate();
      return choped.negate();
    }

    const precision = Dec.calcPrecisionMultiplier(0);

    // Get the truncated quotient and remainder
    const { quotient, remainder } = this.int.divmod(precision);

    // If remainder is zero
    if (remainder.equals(bigInteger(0))) {
      return quotient;
    }

    return quotient.add(bigInteger(1));
  }

  /**
   * Similar to chopPrecisionAndRound, but always rounds down
   */
  protected chopPrecisionAndTruncate(): bigInteger.BigInteger {
    const precision = Dec.calcPrecisionMultiplier(0);
    return this.int.divide(precision);
  }

  public toString(
    prec: number = Dec.precision,
    locale: boolean = false
  ): string {
    const precision = Dec.calcPrecisionMultiplier(0);
    const int = this.int.abs();
    const { quotient: integer, remainder: fraction } = int.divmod(precision);

    let fractionStr = fraction.toString(10);
    for (let i = 0, l = fractionStr.length; i < Dec.precision - l; i++) {
      fractionStr = "0" + fractionStr;
    }
    fractionStr = fractionStr.substring(0, prec);

    const isNegative =
      this.isNegative() &&
      !(integer.eq(bigInteger(0)) && fractionStr.length === 0);

    const integerStr = locale
      ? // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        CoinUtils.integerStringToUSLocaleString(integer.toString())
      : integer.toString();

    return `${isNegative ? "-" : ""}${integerStr}${
      fractionStr.length > 0 ? "." + fractionStr : ""
    }`;
  }

  public round(): Int {
    return new Int(this.chopPrecisionAndRound());
  }

  public roundUp(): Int {
    return new Int(this.chopPrecisionAndRoundUp());
  }

  public truncate(): Int {
    return new Int(this.chopPrecisionAndTruncate());
  }

  public roundDec(): Dec {
    return new Dec(this.chopPrecisionAndRound(), 0);
  }

  public roundUpDec(): Dec {
    return new Dec(this.chopPrecisionAndRoundUp(), 0);
  }

  public truncateDec(): Dec {
    return new Dec(this.chopPrecisionAndTruncate(), 0);
  }
}
