import { Dec } from "./decimal";

export class DecUtils {
  static trim(dec: Dec | string): string {
    let decStr = typeof dec === "string" ? dec : dec.toString();

    if (decStr.indexOf(".") < 0) {
      return decStr;
    }

    for (let i = decStr.length - 1; i >= 0; i--) {
      if (decStr[i] === "0") {
        decStr = decStr.slice(0, i);
      } else {
        break;
      }
    }

    if (decStr.length > 0) {
      if (decStr[decStr.length - 1] === ".") {
        decStr = decStr.slice(0, decStr.length - 1);
      }
    }

    return decStr;
  }

  private static precisions: { [precision: string]: Dec } = {};

  static getPrecisionDec(precision: number): Dec {
    if (precision < -18) {
      throw new Error("Too little precision");
    }
    if (precision > 18) {
      throw new Error("Too much precision");
    }

    if (DecUtils.precisions[precision.toString()]) {
      return DecUtils.precisions[precision.toString()];
    }

    let dec = new Dec(1);

    if (precision > 0) {
      for (let i = 0; i < precision; i++) {
        dec = dec.mul(new Dec(10));
      }
    } else if (precision < 0) {
      for (let i = 0; i < -precision; i++) {
        dec = dec.quo(new Dec(10));
      }
    }

    DecUtils.precisions[precision.toString()] = dec;
    return dec;
  }
}
