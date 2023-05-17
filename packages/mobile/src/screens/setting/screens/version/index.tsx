import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { PageWithScrollViewInBottomTabView } from "../../../../components/page";
import { SettingItem, SettingSectionTitle } from "../../components";
import DeviceInfo from "react-native-device-info";
import codePush from "react-native-code-push";
import { codeBundleId } from "../../../../../bugsnag.env";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";

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

  // Occur an error when the App Version is pressed several times to check whether the error report is successful.
  // Throws a runtime error on the 10th and raises an error on the render itself on the 20th.
  const testErrorReportRef = useRef(0);
  const [blockRender, setBlockRender] = useState(false);

  if (blockRender) {
    throw new Error("This is an render error for error report test");
  }

  return (
    <PageWithScrollViewInBottomTabView backgroundMode="secondary">
      <SettingSectionTitle title="App" />
      <TouchableWithoutFeedback
        onPress={() => {
          testErrorReportRef.current++;

          if (testErrorReportRef.current === 10) {
            setTimeout(() => {
              throw new Error("This is an runtime error for error report test");
            }, 200);
          }

          if (testErrorReportRef.current === 20) {
            setBlockRender(true);
          }
        }}
      >
        <SettingItem
          label="App Version"
          paragraph={appVersion}
          topBorder={true}
        />
      </TouchableWithoutFeedback>
      <SettingItem label="Build Number" paragraph={parseVersion(buildNumber)} />
      <SettingItem
        label="Code Version"
        paragraph={parseVersion(currentCodeVersion)}
      />
      {codeBundleId ? (
        <SettingItem label="Code Bundle ID" paragraph={codeBundleId} />
      ) : null}
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
