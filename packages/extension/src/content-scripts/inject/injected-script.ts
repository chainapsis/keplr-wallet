import { Keplr, KeplrEnigmaUtils, CosmJSOfflineSigner } from "@keplr/provider";
import { init } from "./init";
import { InjectedMessageRequester } from "@keplr/router";

const keplr = new Keplr(new InjectedMessageRequester());

init(
  keplr,
  (chainId: string) => new CosmJSOfflineSigner(chainId, keplr),
  (chainId: string) =>
    new KeplrEnigmaUtils(chainId, new InjectedMessageRequester())
);
