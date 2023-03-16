import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { PermissionBasicAccessPage } from "./basic-access";
import {
  InteractionWaitingData,
  PermissionData,
} from "@keplr-wallet/background";

const UnknownPermissionPage: FunctionComponent<{
  data: InteractionWaitingData<PermissionData>;
}> = observer(({ data }) => {
  return (
    <div>
      <div>Unknown permission</div>
      <div>{JSON.stringify(data.data)}</div>
    </div>
  );
});

export const PermissionPage: FunctionComponent = observer(() => {
  const { permissionStore } = useStore();

  const waitingData = permissionStore.waitingPermissionData;

  if (!waitingData) {
    return <div>loading</div>;
  }

  switch (waitingData.data.type) {
    case "basic-access": {
      return <PermissionBasicAccessPage data={waitingData} />;
    }
    default: {
      return <UnknownPermissionPage data={waitingData} />;
    }
  }
});
