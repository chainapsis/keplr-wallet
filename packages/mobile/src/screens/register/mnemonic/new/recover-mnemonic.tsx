import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { RouteProp, useRoute } from "@react-navigation/native";
import { RegisterConfig } from "@keplr-wallet/hooks";
import { BIP44AdvancedButton, useBIP44Option } from "../../bip44";
import { FlatList, Text, View, ViewStyle } from "react-native";
import { PageWithScrollView } from "components/page";
import { Button } from "components/button";
import { InputCardView } from "components/new/card-view/input-card";
import { useStyle } from "styles/index";
import * as Clipboard from "expo-clipboard";
import { useSmartNavigation } from "navigation/smart-navigation";
import { TabBarView } from "components/new/tab-bar/tab-bar";
import { isPrivateKey, validatePrivateKey } from "utils/format/format";
import { BipButtons } from "screens/register/bip-button";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const bip39 = require("bip39");

enum SeedType {
  WORDS12 = "12 words",
  WORDS24 = "24 words",
  PRIVATE_KEY = "Private key",
}

export const RecoverMnemonicScreen: FunctionComponent = observer(() => {
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

  const [selectedSeed, setSelectedSeed] = useState(SeedType.WORDS12);
  const [seedWords, setSeedWords] = useState<string[]>(
    new Array<string>(12).fill("")
  );
  const [selectedDerivationPath, setIsSelectedDerivationPath] = useState(false);

  const [seedWordsError, setSeedWordsError] = useState<string | undefined>(
    undefined
  );

  const clipboardContent = useRef<string>("");

  useEffect(() => {
    (async function fetchClipboardContent() {
      clipboardContent.current = await Clipboard.getStringAsync();
    })();

    // Listen for changes in the clipboard content
    Clipboard.addClipboardListener(({ content }) => {
      clipboardContent.current = content;
    });
  }, []);

  useEffect(() => {
    setSeedType(selectedSeed);
  }, [selectedSeed]);

  const setSeedType = (seedType: SeedType) => {
    setSelectedSeed(seedType);
    // setShownMnemonicIndex(-1);

    switch (seedType) {
      case SeedType.WORDS12:
        setSeedWords((seedWords) => {
          if (seedWords.length < 12) {
            return seedWords.concat(new Array(12 - seedWords.length).fill(""));
          } else {
            return seedWords.slice(0, 12);
          }
        });
        break;

      case SeedType.WORDS24:
        setSeedWords((seedWords) => {
          if (seedWords.length < 24) {
            return seedWords.concat(new Array(24 - seedWords.length).fill(""));
          } else {
            return seedWords.slice(0, 24);
          }
        });
        break;

      case SeedType.PRIVATE_KEY:
        setSeedWords((seedWords) => seedWords.slice(0, 1));
        break;
    }
  };

  const handlePaste = (value: string, index = 0) => {
    const words = value
      .trim()
      .split(" ")
      .map((word) => word.trim());

    if (words.length === 1) {
      // If the length of pasted words is 1 and the word is guessed as a private key,
      // set seed type as private key automatically.
      if (isPrivateKey(words[0])) {
        setSeedType(SeedType.PRIVATE_KEY);
        setSeedWords([words[0]]);
        return;
      }
    }

    if (words.length === 12 || words.length === 24) {
      // 12/24 words are treated specially.
      // Regardless of where it is pasted from, if it is a valid seed, it will be processed directly.
      if (bip39.validateMnemonic(words.join(" "))) {
        if (words.length === 12) {
          setSeedType(SeedType.WORDS12);
        } else {
          setSeedType(SeedType.WORDS24);
        }

        setSeedWords(words);
        return;
      }
    }

    let newSeedWords = seedWords.slice();
    const expectedLength = Math.min(index + words.length, 24);

    if (seedWords.length < expectedLength) {
      newSeedWords = newSeedWords.concat(
        new Array(expectedLength - seedWords.length).fill("")
      );

      if (expectedLength > 12) {
        setSeedType(SeedType.WORDS24);
      } else {
        setSeedType(SeedType.WORDS12);
      }
    }

    for (let i = index; i < expectedLength; i++) {
      newSeedWords[i] = words[i - index];
    }

    setSeedWords(newSeedWords);
  };

  const validateSeedWords = (seedWords: string[]) => {
    seedWords = seedWords.map((word) => word.trim());
    if (seedWords.join(" ").trim().length === 0) {
      return "__required__";
    }
    if (seedWords.length === 1 && isPrivateKey(seedWords[0])) {
      if (!validatePrivateKey(seedWords[0])) {
        return "__invalid__";
      }
      return undefined;
    } else {
      // num words is the length to the last non-empty word.
      let numWords = 0;
      for (let i = 0; i < seedWords.length; i++) {
        if (seedWords[i].length > 0) {
          numWords = i + 1;
        }
      }

      seedWords = seedWords.slice(0, numWords);
      // If an empty word exists in the middle of words, it is treated as an error.
      if (seedWords.find((word) => word.length === 0)) {
        return "__invalid__";
      }

      if (numWords < 9) {
        return "Too short mnemonic";
      }

      if (!bip39.validateMnemonic(seedWords.join(" "))) {
        return "__invalid__";
      }

      return undefined;
    }
  };

  const handleOnChangeText = async (content: string, index: number) => {
    const isPasted = content.trim().includes(clipboardContent.current.trim());
    if (isPasted) {
      handlePaste(content);
      handlePaste(content);
    } else {
      seedWords[index] = content.trim();
      setSeedWords([...seedWords]);
    }
  };

  const seedWordErrorCheck = () => {
    if (seedWordsError === "__required__") {
      if (selectedSeed === SeedType.PRIVATE_KEY) {
        return "Private key is required";
      } else {
        return "Mnemonic is required";
      }
    }

    if (seedWordsError === "__invalid__") {
      if (selectedSeed === SeedType.PRIVATE_KEY) {
        return "Invalid private key";
      } else {
        return "Invalid mnemonic";
      }
    }

    return seedWordsError;
  };

  const renderInputItem = (items: any) => {
    return (
      <InputCardView
        key={items.index}
        autoCapitalize="none"
        label={selectedSeed === SeedType.PRIVATE_KEY ? "Private key" : null}
        labelStyle={style.flatten(["margin-top-0", "padding-top-0"])}
        containerStyle={[style.flatten(["margin-4", "flex-1"])] as ViewStyle}
        inputStyle={style.flatten(["text-center"])}
        value={items.item}
        multiline={selectedSeed === SeedType.PRIVATE_KEY}
        numberOfLines={selectedSeed === SeedType.PRIVATE_KEY ? 2 : 1}
        onChangeText={(value: string) => handleOnChangeText(value, items.index)}
      />
    );
  };

  const emptyList = seedWords.filter((v) => v !== "");

  return (
    <PageWithScrollView
      backgroundMode="image"
      contentContainerStyle={style.get("flex-grow-1")}
      style={style.flatten(["padding-x-page"]) as ViewStyle}
    >
      <View style={style.flatten(["height-page-pad"]) as ViewStyle} />

      <TabBarView
        listItem={SeedType}
        selected={selectedSeed}
        setSelected={setSelectedSeed}
      />
      <View>
        <FlatList
          data={seedWords}
          extraData={selectedSeed}
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderInputItem}
          numColumns={3}
          contentContainerStyle={style.flatten(["margin-top-10"]) as ViewStyle}
          scrollEnabled={false}
        />
        {seedWordErrorCheck() ? (
          <View
            style={
              style.flatten([
                "border-width-1",
                "border-radius-12",
                "border-color-red-400",
                "padding-10",
                "margin-top-10",
              ]) as ViewStyle
            }
          >
            <Text
              style={
                style.flatten([
                  "color-red-400",
                  "body2",
                  "text-center",
                ]) as ViewStyle
              }
            >
              {seedWordErrorCheck()}
            </Text>
          </View>
        ) : null}
        <BipButtons
          selected={selectedDerivationPath}
          setIsSelected={setIsSelectedDerivationPath}
          clearButtonDisable={emptyList.length === 0}
          onPressClearButton={() =>
            setSeedWords(new Array<string>(seedWords.length).fill(""))
          }
        />
        <BIP44AdvancedButton
          bip44Option={bip44Option}
          selected={selectedDerivationPath}
        />
        {emptyList.length !== seedWords.length ? (
          <Button
            text="Paste all from clipboard"
            size="large"
            mode="outline"
            textStyle={style.flatten(["color-white", "body3", "font-normal"])}
            containerStyle={
              style.flatten([
                "border-radius-32",
                "margin-y-12",
                "border-color-white@40%",
              ]) as ViewStyle
            }
            onPress={async () => {
              const text = await Clipboard.getStringAsync();
              if (text) {
                handlePaste(text);
              }
            }}
          />
        ) : null}
      </View>
      <View style={style.flatten(["flex-1"])} />
      <Button
        containerStyle={style.flatten(["border-radius-32"]) as ViewStyle}
        text="Next"
        size="large"
        onPress={() => {
          const seedWordsError = validateSeedWords(seedWords);
          if (seedWordsError) {
            setSeedWordsError(seedWordsError);
          } else {
            setSeedWordsError(undefined);
            if (seedWords) {
              const encodeSeedWords = encodeURIComponent(
                JSON.stringify(seedWords.join(" ").trim())
              );
              smartNavigation.navigateSmart("Register.CreateAccount", {
                registerConfig: registerConfig,
                mnemonic: encodeSeedWords,
                bip44HDPath: bip44Option.bip44HDPath,
              });
            }
          }
        }}
      />
      {/* Mock element for bottom padding */}
      <View style={style.flatten(["height-page-pad"]) as ViewStyle} />
    </PageWithScrollView>
  );
});
