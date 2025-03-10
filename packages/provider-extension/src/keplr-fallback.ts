import { Keplr } from "./keplr";
import { Keplr as IKeplr } from "@keplr-wallet/types/build/wallet/keplr";

export class KeplrFallback extends Keplr {
  protected isKeplrDetected: boolean | null = null;

  constructor(protected onKeplrNotDetected?: () => void) {
    super();

    if (this.onKeplrNotDetected) {
      Keplr.getKeplr(500).then((keplr) => {
        if (!keplr) {
          this.onKeplrNotDetected?.();
        }
      });
    }
  }

  override async requestMethod(
    method: keyof IKeplr,
    args: any[]
  ): Promise<any> {
    if (this.isKeplrDetected == null) {
      const keplr = await Keplr.getKeplr(500);
      if (keplr) {
        this.isKeplrDetected = true;
      } else {
        this.isKeplrDetected = false;
      }
    }

    if (this.isKeplrDetected) {
      return Keplr.staticRequestMethod(method, args);
    } else {
      const fallback = (window as any).keplr;
      if (fallback) {
        return fallback[method](...args);
      } else {
        throw new Error("Can't detect keplr fallback");
      }
    }
  }
}
