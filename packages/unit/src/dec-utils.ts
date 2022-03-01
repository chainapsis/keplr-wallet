import { Dec } from "./decimal";
import { Int } from "./int";

export class DecUtils {
  public static trim(dec: Dec | string): string {
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

  protected static tenExponentNs: { [n: string]: Dec } = {};

  public static getTenExponentN(n: number): Dec {
    if (n < -Dec.precision) {
      // Dec can only handle up to precision 18.
      // Anything less than 18 precision is 0, so there is a high probability of an error.
      throw new Error("Too little precision");
    }

    if (DecUtils.tenExponentNs[n.toString()]) {
      return DecUtils.tenExponentNs[n.toString()];
    }

    const dec = new Dec(10).pow(new Int(n));
    DecUtils.tenExponentNs[n.toString()] = dec;

    return dec;
  }

  public static getTenExponentNInPrecisionRange(n: number): Dec {
    if (n > Dec.precision) {
      throw new Error("Too much precision");
    }

    return DecUtils.getTenExponentN(n);
  }

  /**
   * @deprecated Use`getTenExponentNInPrecisionRange`
   */
  public static getPrecisionDec(precision: number): Dec {
    return DecUtils.getTenExponentNInPrecisionRange(precision);
  }
}
