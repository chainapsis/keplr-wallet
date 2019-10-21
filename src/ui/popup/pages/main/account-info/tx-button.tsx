import React, { FunctionComponent } from "react";

import styleTxButton from "./tx-button.module.scss";
import { Button } from "../../../../components/button";

export const TxButtonView: FunctionComponent = () => {
  return (
    <div className={styleTxButton.containerTxButton}>
      <Button color="primary" size="medium" to="/send">
        Send
      </Button>
      <Button color="link" size="medium">
        More
      </Button>
    </div>
  );
};
