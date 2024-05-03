import React, { FunctionComponent } from "react";
import { FlatList, Text, View, ViewStyle } from "react-native";
import { observer } from "mobx-react-lite";
import { RouteProp, useRoute } from "@react-navigation/native";
import { RegisterConfig } from "@keplr-wallet/hooks";
import { useNewMnemonicConfig } from "./hook";
import { PageWithScrollView } from "components/page";
import { CheckIcon } from "components/icon";
import { useStyle } from "styles/index";
import { Button } from "components/button";
import * as Clipboard from "expo-clipboard";
import { useForm } from "react-hook-form";
import { useSmartNavigation } from "navigation/smart-navigation";
import { useBIP44Option } from "../bip44";
import { useSimpleTimer } from "hooks/use-simple-timer";
import { WordChip } from "components/mnemonic";

interface FormData {
  name: string;
  password: string;
  confirmPassword: string;
}

export const NewMnemonicScreen: FunctionComponent = observer(() => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          registerConfig: RegisterConfig;
        }
      >,
      string
    >
  >();

  const style = useStyle();

  const smartNavigation = useSmartNavigation();

  const registerConfig: RegisterConfig = route.params.registerConfig;
  const bip44Option = useBIP44Option();

  const newMnemonicConfig = useNewMnemonicConfig(registerConfig);

  const words = newMnemonicConfig.mnemonic.split(" ");

  const { handleSubmit } = useForm<FormData>();

  const submit = handleSubmit(() => {
    smartNavigation.navigateSmart("Register.VerifyMnemonic", {
      registerConfig,
      newMnemonicConfig,
      bip44HDPath: bip44Option.bip44HDPath,
    });
  });

  return (
    <PageWithScrollView
      backgroundMode="image"
      contentContainerStyle={style.get("flex-grow-1")}
      style={style.flatten(["padding-x-page"]) as ViewStyle}
    >
      {/* Mock for flexible margin top */}
      <View style={style.flatten(["max-height-32", "flex-1"]) as ViewStyle} />
      <Text
        style={
          style.flatten([
            "h5",
            "color-text-middle",
            "margin-bottom-4",
            "text-center",
          ]) as ViewStyle
        }
      >
        Backup your mnemonic securely
      </Text>
      <WordsCard words={words} />
      <View style={style.flatten(["flex-1"])} />
      <Button text="Next" size="large" onPress={submit} />
      {/* Mock element for bottom padding */}
      <View style={style.flatten(["height-page-pad"]) as ViewStyle} />
    </PageWithScrollView>
  );
});

const WordsCard: FunctionComponent<{
  words: string[];
}> = ({ words }) => {
  const style = useStyle();
  const { isTimedOut, setTimer } = useSimpleTimer();

  /*
    On IOS, user can peek the words by right side gesture from the verifying mnemonic screen.
    To prevent this, hide the words if the screen lost the focus.
   */
  // const isFocused = useIsFocused();

  // useEffect(() => {
  //   if (isFocused) {
  //     setHideWord(false);
  //   } else {
  //     const timeout = setTimeout(() => {
  //       setHideWord(true);
  //     }, 500);

  //     return () => clearTimeout(timeout);
  //   }
  // }, [isFocused]);

  const renderItem = ({ item, index }: any) => {
    return <WordChip key={index.toString()} word={item} />;
  };

  return (
    <View>
      <FlatList
        data={words}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderItem}
        numColumns={3}
      />
      <View style={style.flatten(["width-full"]) as ViewStyle}>
        <Button
          textStyle={style.flatten(
            ["text-button1", "color-blue-400", "dark:color-platinum-50"],
            [isTimedOut && "color-green-400"]
          )}
          mode="text"
          {...(isTimedOut && {
            rightIcon: (
              <View style={style.flatten(["margin-left-8"]) as ViewStyle}>
                <CheckIcon />
              </View>
            ),
          })}
          text="Copy to clipboard"
          onPress={async () => {
            await Clipboard.setStringAsync(words.join(" "));
            setTimer(3000);
          }}
        />
      </View>
    </View>
  );
};
