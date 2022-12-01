import { InjectedKeplr } from "@keplr-wallet/provider";
import { injectKeplrToWindow } from "@keplr-wallet/provider";

import manifest from "../../manifest.json";

const keplr = new InjectedKeplr(manifest.version, "extension");
injectKeplrToWindow(keplr);
