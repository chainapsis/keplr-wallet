import React, { FunctionComponent, useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { FullFixedPageWithoutPadding } from "../../components/page";
import { useBioAuth } from "../../hooks/bio-auth";
import { SettingBox, SettingTitle } from "../../components/setting";
import * as Keychain from "react-native-keychain";
import FeatherIcon from "react-native-vector-icons/Feather";

export const EnrollLockScreen: FunctionComponent = observer(() => {
  const bioAuth = useBioAuth();
  const [biometryType, setBiometryType] = useState<string>("");

  const getBiometryType = async () => {
    const supportedBiometryType = await Keychain.getSupportedBiometryType();
    setBiometryType(supportedBiometryType ? supportedBiometryType : "");
  };

  const setBioAuth = async () => {
    try {
      const credentials = await Keychain.getGenericPassword({
        accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
      });
      if (credentials) {
        bioAuth?.setUseBioAuth();
      } else {
        console.log("No credentials stored");
      }
    } catch (error) {
      console.log("Keychain couldn't be accessed!", error);
    }
  };

  useEffect(() => {
    getBiometryType();
  }, []);

  return (
    <FullFixedPageWithoutPadding>
      <SettingTitle title="Biometry Authentication" />
      <SettingBox
        isTop
        label="None"
        onPress={bioAuth?.setNotUseBioAuth}
        rightIcon={
          bioAuth?.usingBioAuth === false ? (
            <FeatherIcon name="check" size={18} />
          ) : null
        }
      />
      {biometryType ? (
        <SettingBox
          label={biometryType}
          onPress={setBioAuth}
          rightIcon={
            bioAuth?.usingBioAuth === true ? (
              <FeatherIcon name="check" size={18} />
            ) : null
          }
        />
      ) : null}
    </FullFixedPageWithoutPadding>
  );
});
