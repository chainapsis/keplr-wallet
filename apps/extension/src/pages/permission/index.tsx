import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { PermissionBasicAccessPage } from "./basic-access";
import { GlobalPermissionData, PermissionData } from "@keplr-wallet/background";
import { Splash } from "../../components/splash";
import { GlobalPermissionGetChainInfosPage } from "./get-chain-infos";
import { useInteractionInfo } from "../../hooks";
import { FormattedMessage } from "react-intl";

const UnknownPermissionPage: FunctionComponent<{
  data: {
    ids: string[];
  } & PermissionData;
}> = observer(({ data }) => {
  return (
    <div>
      <div>
        <FormattedMessage id="page.permission.unknown-permission" />
      </div>
      <div>{JSON.stringify(data)}</div>
    </div>
  );
});

const UnknownGlobalPermissionPage: FunctionComponent<{
  data: GlobalPermissionData;
}> = observer(({ data }) => {
  return (
    <div>
      <div>
        <FormattedMessage id="page.permission.unknown-permission" />
      </div>
      <div>{JSON.stringify(data)}</div>
    </div>
  );
});

export const PermissionPage: FunctionComponent = observer(() => {
  const { permissionStore } = useStore();

  useInteractionInfo(() => {
    permissionStore.rejectPermissionAll();
    permissionStore.rejectGlobalPermissionAll();
  });

  const mergedData = permissionStore.waitingPermissionMergedData;
  const globalPermissionData = permissionStore.waitingGlobalPermissionData;

  if (!mergedData && !globalPermissionData) {
    return <Splash />;
  }

  if (mergedData) {
    switch (mergedData.type) {
      case "basic-access": {
        return <PermissionBasicAccessPage data={mergedData} />;
      }
      default: {
        return <UnknownPermissionPage data={mergedData} />;
      }
    }
  }

  if (globalPermissionData) {
    switch (globalPermissionData.data.type) {
      case "get-chain-infos": {
        return (
          <GlobalPermissionGetChainInfosPage data={globalPermissionData} />
        );
      }
      default: {
        return <UnknownGlobalPermissionPage data={globalPermissionData.data} />;
      }
    }
  }

  return null;
});
