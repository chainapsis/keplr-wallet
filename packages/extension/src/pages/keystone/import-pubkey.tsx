import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import { useStore } from "../../stores";
import { Guide } from "./guide";
import { Scan } from "./scan";
import { UR } from "@keplr-wallet/stores";
import { useKeystoneCosmosKeyring } from "@keplr-wallet/hooks";

export const KeystoneImportPubkeyPage = observer(() => {
  const [isScan, setIsScan] = useState(false);

  const { keystoneStore } = useStore();
  const keystoneKeyring = useKeystoneCosmosKeyring();

  const onUnload = () => {
    keystoneStore.resolveGetPubkey({
      abort: true,
    });
  };

  const onScanFinish = async (ur: UR) => {
    keystoneKeyring.getInteraction().onReadUR(async () => {
      return ur;
    });
    await keystoneKeyring.readKeyring();
    const publicKey = await keystoneKeyring.getPubKeys();
    keystoneStore.resolveGetPubkey({
      publicKey,
    });
    window.removeEventListener("unload", onUnload);
    window.close();
  };

  useEffect(() => {
    window.addEventListener("unload", onUnload);
    return () => {
      window.removeEventListener("unload", onUnload);
    };
  }, []);

  return isScan ? (
    <Scan onChange={onScanFinish} />
  ) : (
    <Guide onScan={() => setIsScan(true)} />
  );
});
