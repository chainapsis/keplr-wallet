import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import { Guide } from "./guide";
import { Scan, UR } from "./scan";

export const KeystoneImportPubkeyPage = observer(() => {
  const [isScan, setIsScan] = useState(false);

  const onScanFinish = (ur: UR) => {
    console.log(ur);
  };

  return isScan ? (
    <Scan onChange={onScanFinish} />
  ) : (
    <Guide onScan={() => setIsScan(true)} />
  );
});
