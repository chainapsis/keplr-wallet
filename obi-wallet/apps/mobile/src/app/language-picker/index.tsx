import { observer } from "mobx-react-lite";
import { useState } from "react";
import { Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useStore } from "../stores";
import { DropDownPicker } from "./drop-down-picker";

const allLanguages = [
  {
    code: "en",
    language: "English",
    icon: () => (
      <Image
        source={require("./assets/flag-us.png")}
        style={{ width: 25, height: 25, marginRight: 10 }}
      />
    ),
  },
  {
    code: "de",
    language: "Deutsch",
    icon: () => (
      <Image
        source={require("./assets/flag-de.png")}
        style={{ width: 25, height: 25, marginRight: 10 }}
      />
    ),
  },
  {
    code: "es",
    language: "Espanol",
    icon: () => (
      <Image
        source={require("./assets/flag-es.png")}
        style={{ width: 25, height: 25, marginRight: 10 }}
      />
    ),
  },
];

export const LanguagePicker = observer(() => {
  const languageStore = useStore().languageStore;
  const { currentLanguage, enabledLanguages } = languageStore;

  const handleLanguageChoice = (language: string | null) => {
    if (language) {
      languageStore.setCurrentLanguage(language);
    }
  };

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(currentLanguage);
  const [items, setItems] = useState(() => {
    return allLanguages.filter((lang) => enabledLanguages.includes(lang.code));
  });

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
      <DropDownPicker
        open={open}
        value={value}
        items={items}
        setOpen={setOpen}
        setValue={setValue}
        setItems={setItems}
        schema={{
          label: "language",
          value: "code",
          icon: "icon",
        }}
        itemKey="code"
        itemSeparator={false}
        closeAfterSelecting={true}
        style={{
          backgroundColor: "transparent",
          borderWidth: 0,
        }}
        textStyle={{
          fontSize: 16,
          color: "#F6F5FF",
          textAlign: "left",
          backgroundColor: "transparent",
        }}
        maxHeight={300}
        disableBorderRadius={true}
        stickyHeader={true}
        showArrowIcon={true}
        showTickIcon={false}
        hideSelectedItemIcon={false}
        onChangeValue={(value) => {
          handleLanguageChoice(value);
        }}
      />
    </SafeAreaView>
  );
});
