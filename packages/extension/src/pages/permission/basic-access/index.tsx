import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import {
  InteractionWaitingData,
  PermissionData,
} from "@keplr-wallet/background";
import { Button } from "../../../components/button";
import { useStore } from "../../../stores";
import { useInteractionInfo } from "../../../hooks";

export const PermissionBasicAccessPage: FunctionComponent<{
  data: InteractionWaitingData<PermissionData>;
}> = observer(({ data }) => {
  const { permissionStore } = useStore();

  const interactionInfo = useInteractionInfo(() => {
    permissionStore.rejectPermissionAll();
  });

  return (
    <div>
      <div>{JSON.stringify(data.data)}</div>
      <Button
        text="Approve"
        disabled={permissionStore.waitingPermissionData == null}
        isLoading={permissionStore.waitingPermissionData?.obsolete}
        onClick={async () => {
          await permissionStore.approvePermissionWithProceedNext(
            data.id,
            (proceedNext) => {
              if (!proceedNext) {
                if (
                  interactionInfo.interaction &&
                  !interactionInfo.interactionInternal
                ) {
                  window.close();
                }
              }
            }
          );
        }}
      />
    </div>
  );
});
