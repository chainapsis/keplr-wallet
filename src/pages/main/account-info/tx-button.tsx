import React, { FunctionComponent } from "react";

import styleTxButton from "./tx-button.scss";
import { Button } from "../../../components/button";

export const TxButtonView: FunctionComponent = () => {
  return (
    <div className={styleTxButton.containerTxButton}>
      <Button color="primary">Send</Button>
      <Button color="link">More</Button>
    </div>
  );
};
