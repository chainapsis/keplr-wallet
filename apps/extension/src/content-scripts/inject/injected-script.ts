import { InjectedKeplr } from "@keplr-wallet/provider";
import { injectKeplrToWindow } from "@keplr-wallet/provider";

import manifest from "../../manifest.v2.json";

const keplr = new InjectedKeplr(
  manifest.version,
  "extension",
  undefined,
  undefined,
  {
    uuid: crypto.randomUUID(),
    name: process.env.KEPLR_EXT_EIP6963_PROVIDER_INFO_NAME,
    icon: process.env.KEPLR_EXT_EIP6963_PROVIDER_INFO_ICON,
    rdns: process.env.KEPLR_EXT_EIP6963_PROVIDER_INFO_RDNS,
  }
);
injectKeplrToWindow(keplr);

window.addEventListener("beforeunload", () => {
  keplr.__core__webpageClosed();
});
