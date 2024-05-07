import { InjectedKeplr } from "@keplr-wallet/provider";
import { injectKeplrToWindow } from "@keplr-wallet/provider";

import manifest from "../../manifest.v2.json";

const keplr = new InjectedKeplr(manifest.version, "extension");
injectKeplrToWindow(keplr);
