import { MsgMigrateContractEncodeObject } from "@cosmjs/cosmwasm-stargate";
import { RequestObiSignAndBroadcastMsg } from "@obi-wallet/common";
import { MsgMigrateContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import Long from "long";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import invariant from "tiny-invariant";

import { useMultisigWallet, useStore } from "../stores";
import { Background } from "./components/background";

export const MigrateScreen = observer(() => {
  const { chainStore } = useStore();
  const wallet = useMultisigWallet();
  const { currentChainInformation } = chainStore;
  const multisig = wallet.currentAdmin;

  const encodeObjects = useMemo(() => {
    if (!multisig?.multisig?.address || !wallet.proxyAddress?.address)
      return [];

    const rawMessage = {};

    const value: MsgMigrateContract = {
      sender: multisig.multisig.address,
      codeId: Long.fromInt(currentChainInformation.currentCodeId),
      contract: wallet.proxyAddress.address,
      msg: new Uint8Array(Buffer.from(JSON.stringify(rawMessage))),
    };
    const message: MsgMigrateContractEncodeObject = {
      typeUrl: "/cosmwasm.wasm.v1.MsgMigrateContract",
      value,
    };
    return [message];
  }, [currentChainInformation, multisig, wallet]);

  useEffect(() => {
    if (encodeObjects.length > 0) {
      (async () => {
        const response = await RequestObiSignAndBroadcastMsg.send({
          id: wallet.id,
          encodeObjects,
          multisig,
          cancelable: false,
        });

        try {
          invariant(
            wallet.proxyAddress?.address,
            "Expected proxy address to exist."
          );
          console.log(response);
          wallet.finishProxySetup({
            address: wallet.proxyAddress.address,
            codeId: chainStore.currentChainInformation.currentCodeId,
          });
        } catch (e) {
          console.log(response.rawLog);
        }
      })();
    }
  }, [chainStore, encodeObjects, multisig, wallet]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Background />
    </SafeAreaView>
  );
});
