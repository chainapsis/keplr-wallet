import { observer } from "mobx-react-lite";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { useStore } from "../../app/stores";
import { DropDownPicker } from "./index";

export const LanguagePicker = observer(() => {
  const languageStore = useStore().languageStore;

  const GetLanguages = languageStore.getLanguages();
  const currentLanguage = languageStore.currentLanguage;

  const handleLanguageChoice = (langCode) => {
    const language = GetLanguages.find(
      (object) => object.languagecode === langCode
    );
    languageStore.setCurrentLanguage(language);
  };

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(currentLanguage.languagecode); // Default: Current Device Language on first load
  const [items, setItems] = useState(GetLanguages);

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
          value: "languagecode",
          icon: "icon",
        }}
        itemKey="languagecode"
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
