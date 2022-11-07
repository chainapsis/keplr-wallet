import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import { useStore } from "../../stores";
import { Guide } from "./guide";
import { Scan } from "./scan";
import { UR } from "@keplr-wallet/stores";

export const KeystoneImportPubkeyPage = observer(() => {
  const [isScan, setIsScan] = useState(false);

  const { keystoneStore } = useStore();

  const onUnload = () => {
    keystoneStore.resolveGetPubkey({
      abort: true,
    });
  };

  const onScanFinish = async (ur: UR) => {
    keystoneStore.resolveGetPubkey({
      publicKey: ur,
    });
    window.removeEventListener("unload", onUnload);
    window.close();
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-keystone-import-page", "true");
    window.addEventListener("unload", onUnload);
    return () => {
      window.removeEventListener("unload", onUnload);
      document.documentElement.removeAttribute("data-keystone-import-page");
    };
  }, []);

  return isScan ? (
    <Scan type="sync" onChange={onScanFinish} />
  ) : (
    <Guide onScan={() => setIsScan(true)} />
  );
});
