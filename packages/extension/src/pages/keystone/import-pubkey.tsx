import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import { useStore } from "../../stores";
import { Guide } from "./guide";
import { Scan } from "./scan";
import { UR } from "@keplr-wallet/stores";

export const KeystoneImportPubkeyPage = observer(() => {
  const [isScan, setIsScan] = useState(false);

  const { keystoneStore } = useStore();

  const parseHDPath = (hdPath: string) => {
    const parts = hdPath.split("/");
    return {
      coinType: +parts[2].replace("'", ""),
      bip44HDPath: {
        account: +parts[3].replace("'", ""),
        change: +parts[4],
        addressIndex: +parts[5],
      },
    };
  };

  const decodeUR = (ur: UR) => {
    return {
      device: "",
      xfp: "",
      name: "",
      keys: [
        {
          ...parseHDPath("m/44'/118'/0'/0/0"),
          pubKey:
            "02bda203ca44c955f1db94bb0d34ef072cebeb27f5bc7b13656bb2881301d017a6",
          index: 0,
        },
        {
          ...parseHDPath("m/44'/234'/0'/0/0"),
          pubKey:
            "02bda203ca44c955f1db94bb0d34ef072cebeb27f5bc7b13656bb2881301d017a6",
          index: 1,
        },
      ],
    };
  };

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
