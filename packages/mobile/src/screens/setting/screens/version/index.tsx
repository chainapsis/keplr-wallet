import React, { FunctionComponent, useEffect, useState } from "react";
import { PageWithScrollViewInBottomTabView } from "../../../../components/page";
import { SettingItem, SettingSectionTitle } from "../../components";
import DeviceInfo from "react-native-device-info";
import codePush from "react-native-code-push";

export const KeplrVersionScreen: FunctionComponent = () => {
  const [appVersion] = useState(() => DeviceInfo.getVersion());
  const [buildNumber] = useState(() => DeviceInfo.getBuildNumber());
  // "undefined" means that it is on fetching,
  // empty string "" means that there is no data.
  const [currentCodeVersion, setCurrentCodeVersion] = useState<
    string | undefined
  >(undefined);
  const [latestCodeVersion, setLatestCodeVersion] = useState<
    string | undefined
  >(undefined);
  const [pendingCodeVersion, setPendingCodeVersion] = useState<
    string | undefined
  >(undefined);

  useEffect(() => {
    codePush.getUpdateMetadata(codePush.UpdateState.RUNNING).then((update) => {
      if (update) {
        setCurrentCodeVersion(update.label);
      } else {
        setCurrentCodeVersion("");
      }
    });

    codePush.getUpdateMetadata(codePush.UpdateState.LATEST).then((update) => {
      if (update) {
        setLatestCodeVersion(update.label);
      } else {
        setLatestCodeVersion("");
      }
    });

    codePush.getUpdateMetadata(codePush.UpdateState.PENDING).then((update) => {
      if (update) {
        setPendingCodeVersion(update.label);
      } else {
        setPendingCodeVersion("");
      }
    });
  }, []);

  const parseVersion = (version: string | undefined) => {
    if (version === undefined) {
      return "Fetching...";
    }

    if (version === "") {
      return "None";
    }

    return version;
  };

  return (
    <PageWithScrollViewInBottomTabView>
      <SettingSectionTitle title="App" />
      <SettingItem
        label="App Version"
        paragraph={appVersion}
        topBorder={true}
      />
      <SettingItem label="Build Number" paragraph={parseVersion(buildNumber)} />
      <SettingItem
        label="Code Version"
        paragraph={parseVersion(currentCodeVersion)}
      />
      <SettingSectionTitle title="Remote" />
      <SettingItem
        label="Latest Code Version"
        paragraph={parseVersion(latestCodeVersion)}
        topBorder={true}
      />
      <SettingItem
        label="Pending Code Version"
        paragraph={parseVersion(pendingCodeVersion)}
      />
    </PageWithScrollViewInBottomTabView>
  );
};
