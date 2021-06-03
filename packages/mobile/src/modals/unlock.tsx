import React, {
  FunctionComponent,
  useState,
  useEffect,
  useCallback,
} from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../stores";
import { View } from "react-native";
import { Text } from "react-native-elements";
import { sf, h4, fAlignCenter, my3, flex1 } from "../styles";
import { Input } from "../components/form";
import * as Keychain from "react-native-keychain";
import { useBioAuth } from "../hooks/bio-auth";
import { FullFixedPage } from "../components/page";
import { FlexButtonWithHoc } from "./common";

const BioUnlock: FunctionComponent<{
  setIsFailed: React.Dispatch<React.SetStateAction<boolean>>;
}> = observer(({ setIsFailed }) => {
  const { interactionModalStore, keyRingStore } = useStore();

  const firstBioAuth = useCallback(async () => {
    try {
      const credentials = await Keychain.getGenericPassword({
        accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
      });
      if (credentials) {
        await keyRingStore.unlock(credentials.password);
        interactionModalStore.popAll("/unlock");
      } else {
        console.log("No credentials stored");
      }
    } catch (error) {
      console.log("Keychain couldn't be accessed!", error);
      setIsFailed(true);
    }
  }, [interactionModalStore, keyRingStore, setIsFailed]);

  useEffect(() => {
    firstBioAuth();
  }, [firstBioAuth]);

  return null;
});

export const UnlockView: FunctionComponent = observer(() => {
  const bioAuth = useBioAuth();

  const { interactionModalStore, keyRingStore } = useStore();

  const [password, setPassword] = useState("");
  const [isFailed, setIsFailed] = useState(false);

  return (
    <FullFixedPage>
      {bioAuth?.usingBioAuth === true && isFailed === false ? (
        <BioUnlock setIsFailed={setIsFailed} />
      ) : null}
      <View style={flex1} />
      <View>
        <Text style={sf([h4, fAlignCenter, my3])}>Unlock</Text>
        <Input
          label="Password"
          autoCompleteType="password"
          secureTextEntry={true}
          value={password}
          onChangeText={setPassword}
        />
        <View style={{ height: 45 }}>
          <FlexButtonWithHoc
            title="Unlock"
            onPress={async () => {
              await keyRingStore.unlock(password);
              interactionModalStore.popAll("/unlock");
            }}
          />
        </View>
      </View>
      <View style={flex1} />
    </FullFixedPage>
  );
});
