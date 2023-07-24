import { observer } from "mobx-react-lite";
import React, { useCallback, useEffect, useState } from "react";
import { useStore } from "../../stores";
import { Guide } from "./guide";
import { Scan, ScanType } from "./scan";
import { UR } from "@keplr-wallet/stores";

export const KeystoneImportPubkeyPage = observer(() => {
  const [isScan, setIsScan] = useState(false);

  const { keystoneStore } = useStore();

  const onUnload = useCallback(() => {
    keystoneStore.resolveGetPubkey({
      abort: true,
    });
  }, [keystoneStore]);

  const onScanFinish = async (ur: UR) => {
    keystoneStore.resolveGetPubkey({
      publicKey: ur,
    });
    window.removeEventListener("unload", onUnload);
    window.close();
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-keystone-page", "true");
    window.addEventListener("unload", onUnload);
    return () => {
      window.removeEventListener("unload", onUnload);
      document.documentElement.removeAttribute("data-keystone-page");
    };
  }, [onUnload]);

  return isScan ? (
    <Scan
      type={ScanType.Sync}
      onChange={onScanFinish}
      onBack={() => setIsScan(false)}
    />
  ) : (
    <Guide onScan={() => setIsScan(true)} />
  );
});
