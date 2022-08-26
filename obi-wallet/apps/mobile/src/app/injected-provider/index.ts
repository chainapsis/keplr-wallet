import { useEffect, useState } from "react";
import { Platform } from "react-native";
import RNFS from "react-native-fs";

let code: string | null = null;

export function useInjectedProvider() {
  const [, setLoaded] = useState(code !== null);

  useEffect(() => {
    (async () => {
      if (code) return;

      if (Platform.OS === "ios") {
        code = await RNFS.readFile(`${RNFS.MainBundlePath}/index.js`);
      } else if (Platform.OS === "android") {
        code = await RNFS.readFileAssets("index.js");
      }

      setLoaded(true);
    })();
  }, []);

  return code;
}
