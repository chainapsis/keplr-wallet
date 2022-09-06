import { Keplr } from "@keplr-wallet/provider";
import { MessageRequesterExternal } from "@obi-wallet/common";
import { useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";
import { INJECTED_PROVIDER_HOST } from "react-native-dotenv";
import RNFS from "react-native-fs";

let code: string | null = null;

class ConcreteKeplr extends Keplr {}

export function useKeplr({ url }: { url: string }) {
  const keplr = useMemo(() => {
    return new ConcreteKeplr(
      "0.10.10",
      "core",
      new MessageRequesterExternal({
        url: url,
        origin: new URL(url).origin,
      })
    );
  }, [url]);
  return keplr;
}

export function useInjectedProvider() {
  const [, setLoaded] = useState(code !== null);

  useEffect(() => {
    (async () => {
      if (code) return;

      if (INJECTED_PROVIDER_HOST) {
        const response = await fetch(
          `${INJECTED_PROVIDER_HOST}injected-provider.js`
        );
        code = await response.text();
      } else if (Platform.OS === "ios") {
        code = await RNFS.readFile(
          `${RNFS.MainBundlePath}/injected-provider.js`
        );
      } else if (Platform.OS === "android") {
        code = await RNFS.readFileAssets("injected-provider.js");
      }

      setLoaded(true);
    })();
  }, []);

  return code;
}
