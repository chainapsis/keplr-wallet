import { faChevronDown } from "@fortawesome/free-solid-svg-icons/faChevronDown";
import { faChevronUp } from "@fortawesome/free-solid-svg-icons/faChevronUp";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { Text } from "@obi-wallet/common";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { Image, View } from "react-native";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

import { getScreenDimensions } from "../screens/components/screen-size";
import { languageArray } from "./languages";

interface Props {
  data: Array<{ label: string; value: string }>;
}

export const LanguagePicker = observer<Props>(({ data }) => {
  const [currentLanguage, setCurrentLanguage] = useState(languageArray[0]); // Default: English
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  const handleShowDropdown = () => {
    showLanguageDropdown
      ? setShowLanguageDropdown(false)
      : setShowLanguageDropdown(true);
  };

  const handleLanguageChoice = (code) => {
    const language = languageArray.find(
      (object) => object.languagecode === code
    );

    setCurrentLanguage(language);
    setShowLanguageDropdown(false);
  };

  return (
    <SafeAreaView
      style={{
        flexDirection: "column",
        alignItems: "flex-end",
        position: "absolute",
        top: 0,
        left: 0,
      }}
    >
      <TouchableWithoutFeedback
        // Touchable-Layer to enable Dropdown-Close on outside-click
        onPress={() => {
          setShowLanguageDropdown(false);
        }}
        style={{
          width: getScreenDimensions().SCREEN_WIDTH,
          height: getScreenDimensions().SCREEN_HEIGHT,
          zIndex: 1,
        }}
      >
        <TouchableWithoutFeedback
          onPress={() => handleShowDropdown()}
          style={{
            marginTop: 15,
            marginLeft: 10,
            padding: 10,
            width: 145,
            height: 50,
          }}
        >
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "center",
              width: 145,
              height: 50,
            }}
          >
            <Image
              style={{ width: 25, height: 25, marginRight: 10 }}
              source={currentLanguage.flag}
            />
            <Text
              style={{ fontSize: 14, color: "#F6F5FF", letterSpacing: 0.3 }}
            >
              {currentLanguage.language}
            </Text>
            <FontAwesomeIcon
              icon={
                showLanguageDropdown === false ? faChevronDown : faChevronUp
              }
              style={{ color: "#7B87A8", marginLeft: 10 }}
            />
          </View>
        </TouchableWithoutFeedback>

        {showLanguageDropdown &&
          languageArray.map((object) => {
            if (currentLanguage.languagecode === object.languagecode) {
              return null;
            } else {
              return (
                <TouchableWithoutFeedback
                  key={object.languagecode}
                  onPress={() => {
                    handleLanguageChoice(object.languagecode);
                  }}
                  style={{
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    marginLeft: 10,
                    padding: 10,
                    width: 145,
                  }}
                >
                  <Image
                    style={{ width: 25, height: 25, marginRight: 10 }}
                    source={object.flag}
                  />

                  <Text
                    onPress={() => {
                      handleLanguageChoice(object.languagecode);
                    }}
                    style={{
                      fontSize: 14,
                      color: "#F6F5FF",
                      letterSpacing: 0.3,
                    }}
                  >
                    {object.language}
                  </Text>
                </TouchableWithoutFeedback>
              );
            }
          })}
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
});
