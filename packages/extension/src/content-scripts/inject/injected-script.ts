import {
  Keplr,
  KeplrEnigmaUtils,
  CosmJSOfflineSigner,
} from "@keplr-wallet/provider";
import { init } from "./init";
import { InjectedMessageRequester } from "@keplr-wallet/router";

const keplr = new Keplr(new InjectedMessageRequester());

init(
  keplr,
  (chainId: string) => new CosmJSOfflineSigner(chainId, keplr),
  (chainId: string) =>
    new KeplrEnigmaUtils(chainId, new InjectedMessageRequester())
);
