import React, { FunctionComponent, useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../stores";
import { gestureHandlerRootHOC } from "react-native-gesture-handler";
import { Text } from "react-native-elements";
import { sf, h4, fAlignCenter, my3 } from "../styles";
import { FlexButton } from "../components/buttons";
import { Input } from "../components/input";
import * as Keychain from "react-native-keychain";
import { useBioAuth } from "../hooks/bio-auth";

const BioUnlock: FunctionComponent<{
  setIsFailed: React.Dispatch<React.SetStateAction<boolean>>;
}> = observer(({ setIsFailed }) => {
  const { interactionModalStore, keyRingStore } = useStore();

  const firstBioAuth = async () => {
    try {
      const credentials = await Keychain.getGenericPassword({
        accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
      });
      if (credentials) {
        await keyRingStore.unlock(credentials.password);
        interactionModalStore.popUrl();
      } else {
        console.log("No credentials stored");
      }
    } catch (error) {
      console.log("Keychain couldn't be accessed!", error);
      setIsFailed(true);
    }
  };

  useEffect(() => {
    firstBioAuth();
  }, []);

  return <Text style={sf([h4, fAlignCenter, my3])}>bio</Text>;
});

export const UnlockView: FunctionComponent = observer(() => {
  const bioAuth = useBioAuth();

  const { interactionModalStore, keyRingStore } = useStore();

  const [password, setPassword] = useState("");
  const [isFailed, setIsFailed] = useState(false);

  // RectButton in Modal only working in HOC on android
  const UnlockButtonWithHoc = gestureHandlerRootHOC(() => {
    return (
      <FlexButton
        title="Unlock"
        onPress={async () => {
          await keyRingStore.unlock(password);
          interactionModalStore.popUrl();
        }}
      />
    );
  });

  return bioAuth?.usingBioAuth === true && isFailed === false ? (
    <BioUnlock setIsFailed={setIsFailed} />
  ) : (
    <React.Fragment>
      <Text style={sf([h4, fAlignCenter, my3])}>Unlock</Text>
      <Input
        label="Password"
        autoCompleteType="password"
        secureTextEntry={true}
        value={password}
        onChangeText={setPassword}
      />
      <UnlockButtonWithHoc />
    </React.Fragment>
  );
});
