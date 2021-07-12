import React, {
  FunctionComponent,
  useState,
  useEffect,
  useCallback,
} from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../stores";
import { View } from "react-native";
import * as Keychain from "react-native-keychain";
import { useBioAuth } from "../hooks/bio-auth";
import { FullFixedPage } from "../components/page";
import { TextInput } from "../components/staging/input";
import { Button } from "../components/staging/button";
import { useStyle } from "../styles";

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

  const style = useStyle();

  const { interactionModalStore, keyRingStore } = useStore();

  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFailed, setIsFailed] = useState(false);

  const tryUnlock = async () => {
    try {
      setIsLoading(true);
      await keyRingStore.unlock(password);
    } catch (e) {
      console.log(e);
      setIsFailed(true);
      return;
    } finally {
      setIsLoading(false);
    }
    interactionModalStore.popAll("/unlock");
  };

  return (
    <FullFixedPage>
      {bioAuth?.usingBioAuth === true && isFailed === false ? (
        <BioUnlock setIsFailed={setIsFailed} />
      ) : null}
      <View style={style.flatten(["flex-1"])} />
      <View>
        <TextInput
          label="Password"
          returnKeyType="done"
          secureTextEntry={true}
          value={password}
          error={isFailed ? "Invalid password" : undefined}
          onChangeText={setPassword}
          onSubmitEditing={tryUnlock}
        />
        <Button text="Sign in" loading={isLoading} onPress={tryUnlock} />
      </View>
      <View style={style.flatten(["flex-1"])} />
    </FullFixedPage>
  );
});
