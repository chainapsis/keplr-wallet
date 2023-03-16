import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import {
  InteractionWaitingData,
  PermissionData,
} from "@keplr-wallet/background";
import { Button } from "../../../components/button";
import { useStore } from "../../../stores";

export const PermissionBasicAccessPage: FunctionComponent<{
  data: InteractionWaitingData<PermissionData>;
}> = observer(({ data }) => {
  const { permissionStore } = useStore();

  return (
    <div>
      <div>{JSON.stringify(data.data)}</div>
      <Button
        text="Approve"
        onClick={async () => {
          // TODO: Handle loading state
          await permissionStore.approvePermission(data.id);

          if (permissionStore.waitingPermissionDatas.length === 0) {
            window.close();
          }
        }}
      />
    </div>
  );
});
