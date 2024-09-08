import { InjectedKeplr } from "@keplr-wallet/provider";
import { injectKeplrToWindow } from "@keplr-wallet/provider";
import { Account, RpcProvider } from "starknet";

import manifest from "../../manifest.v2.json";
import { SignerInterfaceImpl } from "./starknet-signer";

const keplr = new InjectedKeplr(
  manifest.version,
  "extension",
  (state) => {
    // TODO: RpcProvider와 Account를 starknetjs에서 바로 가져와서 씀으로 인해서
    //       injected script의 크기가 너무 커져버렸다.
    //       크기를 줄이는 작업이 필요하다.
    if (state.rpc) {
      if (!keplr.starknet.provider) {
        keplr.starknet.provider = new RpcProvider({
          nodeUrl: state.rpc,
        });
      } else {
        keplr.starknet.provider.channel.nodeUrl = state.rpc;
      }
    }

    if (keplr.starknet.provider) {
      if (state.selectedAddress) {
        if (!keplr.starknet.account) {
          keplr.starknet.account = new Account(
            keplr.starknet.provider,
            state.selectedAddress,
            new SignerInterfaceImpl(keplr)
          );
        } else {
          keplr.starknet.account.address = state.selectedAddress;
        }
      } else {
        keplr.starknet.account = undefined;
      }
    } else {
      keplr.starknet.account = undefined;
    }
  },
  {
    addMessageListener: (fn: (e: any) => void) =>
      window.addEventListener("message", fn),
    removeMessageListener: (fn: (e: any) => void) =>
      window.removeEventListener("message", fn),
    postMessage: (message) =>
      window.postMessage(message, window.location.origin),
  },
  undefined,
  {
    uuid: crypto.randomUUID(),
    name: process.env.KEPLR_EXT_EIP6963_PROVIDER_INFO_NAME,
    icon: process.env.KEPLR_EXT_EIP6963_PROVIDER_INFO_ICON,
    rdns: process.env.KEPLR_EXT_EIP6963_PROVIDER_INFO_RDNS,
  },
  {
    id: process.env.KEPLR_EXT_STARKNET_PROVIDER_INFO_ID,
    name: process.env.KEPLR_EXT_STARKNET_PROVIDER_INFO_NAME,
    icon: process.env.KEPLR_EXT_STARKNET_PROVIDER_INFO_ICON,
  }
);
injectKeplrToWindow(keplr);
