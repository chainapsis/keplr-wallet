import "./src/background/background";

import { Keplr } from "@keplr-wallet/provider";
import { RNMessageRequester } from "./src/router";

// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
window.keplr = new Keplr("", new RNMessageRequester());
