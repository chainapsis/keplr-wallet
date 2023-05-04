import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { PermissionBasicAccessPage } from "./basic-access";
import { PermissionData } from "@keplr-wallet/background";

const UnknownPermissionPage: FunctionComponent<{
  data: {
    ids: string[];
  } & PermissionData;
}> = observer(({ data }) => {
  return (
    <div>
      <div>Unknown permission</div>
      <div>{JSON.stringify(data)}</div>
    </div>
  );
});

export const PermissionPage: FunctionComponent = observer(() => {
  const { permissionStore } = useStore();

  const mergedData = permissionStore.waitingPermissionMergedData;

  if (!mergedData) {
    return <div>loading</div>;
  }

  switch (mergedData.type) {
    case "basic-access": {
      return <PermissionBasicAccessPage data={mergedData} />;
    }
    default: {
      return <UnknownPermissionPage data={mergedData} />;
    }
  }
});
