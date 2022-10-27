import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import { useStore } from "../../stores";
import { Guide } from "./guide";
import { Scan } from "./scan";
import { UR } from "@keplr-wallet/stores";
import { decodeUR } from "./utils";

export const KeystoneImportPubkeyPage = observer(() => {
  const [isScan, setIsScan] = useState(false);

  const { keystoneStore } = useStore();

  const onScanFinish = (ur: UR) => {
    const data = decodeUR(ur);
    keystoneStore.resolveGetPubkey({
      publicKey: data.keys,
    });
    window.removeEventListener("unload", onUnload);
    window.close();
  };

  const onUnload = () => {
    keystoneStore.resolveGetPubkey({
      abort: true,
    });
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
