import React, { FunctionComponent } from "react";

import { Button } from "reactstrap";

import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import { LedgerInitResumeMsg } from "../../../../background/ledger/messages";
import { sendMessage } from "../../../../common/message/send";
import { BACKGROUND_PORT } from "../../../../common/message/constant";
const CosmosApp: any = require("ledger-cosmos-js").default;

export const LedgerGrantPage: FunctionComponent = () => {
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
