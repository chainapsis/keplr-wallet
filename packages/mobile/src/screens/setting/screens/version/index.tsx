import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { PageWithScrollView } from "components/page";
import DeviceInfo from "react-native-device-info";
import codePush from "react-native-code-push";
import { codeBundleId } from "../../../../../bugsnag.env";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { Right, SettingItem } from "screens/setting/components";
import { useStyle } from "styles/index";
import { ViewStyle } from "react-native";

export const FetchVersionScreen: FunctionComponent = () => {
  const style = useStyle();
  const [appVersion] = useState(() => DeviceInfo.getVersion());
  const [buildNumber] = useState(() => DeviceInfo.getBuildNumber());
  // "undefined" means that it is on fetching,
  // empty string "" means that there is no data.
  const [currentCodeVersion, setCurrentCodeVersion] = useState<
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
    <PageWithScrollView backgroundMode="image">
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
          label="App version"
          backgroundBlur={false}
          bottomBorder={true}
          right={<Right paragraph={appVersion} />}
          style={style.flatten(["padding-0"]) as ViewStyle}
          containerStyle={style.flatten(["padding-x-20"]) as ViewStyle}
        />
      </TouchableWithoutFeedback>
      <SettingItem
        label="Build number"
        backgroundBlur={false}
        bottomBorder={true}
        right={<Right paragraph={parseVersion(buildNumber)} />}
        style={style.flatten(["padding-0"]) as ViewStyle}
        containerStyle={style.flatten(["padding-x-20"]) as ViewStyle}
      />
      <SettingItem
        label="Code version"
        backgroundBlur={false}
        bottomBorder={true}
        right={<Right paragraph={parseVersion(currentCodeVersion)} />}
        style={style.flatten(["padding-0"]) as ViewStyle}
        containerStyle={style.flatten(["padding-x-20"]) as ViewStyle}
      />
      {codeBundleId ? (
        <SettingItem label="Code Bundle ID" paragraph={codeBundleId} />
      ) : null}
    </PageWithScrollView>
  );
};
