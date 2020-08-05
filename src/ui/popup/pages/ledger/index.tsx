import React, { FunctionComponent } from "react";

import { Button } from "reactstrap";

import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
const CosmosApp: any = require("ledger-cosmos-js").default;

export const LedgerGrantPage: FunctionComponent = () => {
  return (
    <Button
      onClick={async e => {
        e.preventDefault();

        const cosmosApp = new CosmosApp(await TransportWebUSB.create());

        console.log(await cosmosApp.getVersion());
      }}
    >
      Grant Permission
    </Button>
  );
};
