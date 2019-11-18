import React, { FunctionComponent } from "react";

import styleTxButton from "./tx-button.module.scss";
import { Button } from "../../../components/button";
import { observer } from "mobx-react";
import { useStore } from "../../stores";

export const TxButtonView: FunctionComponent = observer(() => {
  const { chainStore } = useStore();

  return (
    <div className={styleTxButton.containerTxButton}>
      <Button color="primary" size="medium" to="/send">
        Send
      </Button>
      <Button
        color="link"
        size="medium"
        href={chainStore.chainInfo.walletUrl}
        target="_blank"
      >
        More
      </Button>
    </div>
  );
});
