import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { Button } from "reactstrap";
import { useStore } from "../../../stores";

export const ICNSAdr36SignPage: FunctionComponent = observer(() => {
  const { icnsInteractionStore } = useStore();

  return (
    <Button
      onClick={(e) => {
        e.preventDefault();

        if (icnsInteractionStore.waitingData) {
          icnsInteractionStore.approve(icnsInteractionStore.waitingData.id);
        }

        window.close();
      }}
    >
      tes
    </Button>
  );
});
