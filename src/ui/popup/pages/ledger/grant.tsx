import React, { FunctionComponent, useEffect } from "react";

import { Button } from "reactstrap";

import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import { LedgerInitResumeMsg } from "../../../../background/ledger/messages";
import { sendMessage } from "../../../../common/message/send";
import { BACKGROUND_PORT } from "../../../../common/message/constant";
const CosmosApp: any = require("ledger-cosmos-js").default;

export const LedgerGrantPage: FunctionComponent = () => {
  useEffect(() => {
    const close = () => {
      // Close window after 3 seconds.
      setTimeout(window.close, 3000);
    };

    window.addEventListener("ledgerSignCompleted", close);

    return () => {
      window.removeEventListener("ledgerSignCompleted", close);
    };
  }, []);

  return (
    <Button
      onClick={async e => {
        e.preventDefault();

        const transport = await TransportWebUSB.create();
        const cosmosApp = new CosmosApp(transport);

        console.log(await cosmosApp.getVersion());
        await transport.close();

        const msg = new LedgerInitResumeMsg();
        await sendMessage(BACKGROUND_PORT, msg);
      }}
    >
      Grant Permission
    </Button>
  );
};
