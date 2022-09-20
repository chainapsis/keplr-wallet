import { Text, TextInput as OriginalTextInput } from "@obi-wallet/common";
import { ComponentType, useEffect, useState } from "react";
import {
  StyleProp,
  StyleSheet,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
  ScrollView,
} from "react-native";
import CountryPicker, {
  CountryModalProvider,
} from "react-native-country-picker-modal";
import { DARK_THEME } from "react-native-country-picker-modal";
import { CountryCode, Country } from "react-native-country-picker-modal";
import { TouchableOpacity } from "react-native-gesture-handler";

import { useStore } from "../stores";

const styles = StyleSheet.create({
  label: {
    color: "#787B9C",
    fontSize: 10,
    marginBottom: 12,
    textTransform: "uppercase",
  },
  wholeview: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 56,
    borderWidth: 1,
    borderColor: "#2F2B4C",
    fontSize: 14,
    fontWeight: 500,
    color: "#F6F5FF",
    borderRadius: 12,
  },
  buttonview: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 14,
    fontWeight: 500,
  },
  inputview: {
    flex: 1,
    flexDirection: "row",
    height: 56,
    borderColor: "#2F2B4C",
    borderLeftWidth: 1,
    fontSize: 14,
    fontWeight: 500,
    color: "#F6F5FF",
  },
  input: {
    flex: 1,
    paddingLeft: 20,
    color: "#F6F5FF",
  },
  data: {
    backgroundColor: "white",
    padding: 10,
  },
});

export function PhoneInput({
  label,
  style,
  inputStyle,
  CustomTextInput = OriginalTextInput,
  handlePhoneNumberCountryCode,
  ...props
}: TextInputProps & {
  CustomTextInput?: ComponentType<TextInputProps>;
  label?: string;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  handlePhoneNumberCountryCode: (param: string) => void;
}) {
  const { languageStore } = useStore();
  const { currentLanguage } = languageStore;

  // possible Languages to add
  // "common","cym","deu","fra","hrv","ita","jpn","nld","por","rus","spa","svk","fin","zho","isr";

  const dropdownLanguage = (langCode: string) => {
    if (langCode === "de") {
      return "deu";
    } else if (langCode === "es") {
      return "spa";
    } else {
      return "common"; // English
    }
  };

  const [visible, setVisible] = useState(false);
  const switchVisible = () => setVisible(!visible);
  const onSelect = (country: Country) => {
    setCountryCode(country.cca2);
    setCountry(country);
  };
  // Default Selection
  const [countryCode, setCountryCode] = useState<CountryCode>("US");
  const [country, setCountry] = useState<Country>({
    callingCode: ["1"],
    cca2: "US",
    currency: ["USD"],
    flag: "flag-us",
    name: "United States",
    region: "Americas",
    subregion: "North America",
  });
  const withCountryNameButton = false;
  const withCurrencyButton = false;
  const withFlagButton = true;
  const withCallingCodeButton = true;
  const withFlag = true;
  const withEmoji = false;
  const withFilter = true;
  const withAlphaFilter = false;
  const withCallingCode = true;
  const withCurrency = false;
  const withModal = true;
  const dark = false;
  const fontScaling = true;
  const disableNativeModal = false;
  const preferredCountries = undefined; // ["US"]

  useEffect(() => {
    handlePhoneNumberCountryCode("+" + country.callingCode); // Pass country.callingcode back to parent component "onboarding2"
  }, [country.callingCode, handlePhoneNumberCountryCode]);

  return (
    <View style={style}>
      <CountryModalProvider>
        <ScrollView>
          {label ? <Text style={styles.label}>{label}</Text> : null}

          <View style={styles.wholeview}>
            <TouchableOpacity style={styles.buttonview} onPress={switchVisible}>
              <CountryPicker
                theme={
                  dark
                    ? DARK_THEME
                    : {
                        primaryColor: "blue",
                        primaryColorVariant: "#090816",
                        backgroundColor: "#090816",
                        onBackgroundTextColor: "#F6F5FF",
                        fontSize: 14,
                        filterPlaceholderTextColor: "#4B4E6E",
                        activeOpacity: 0.7,
                      }
                }
                {...{
                  allowFontScaling: fontScaling,
                  countryCode,
                  withFilter,
                  excludeCountries: ["AQ", "BV", "TF", "HM", "UM"], // No Calling-Code available
                  withFlag,
                  withCurrencyButton,
                  withCallingCodeButton,
                  withCountryNameButton,
                  withAlphaFilter,
                  withCallingCode,
                  withCurrency,
                  withEmoji,
                  withModal,
                  withFlagButton,
                  onSelect,
                  disableNativeModal,
                  preferredCountries,
                  modalProps: {
                    visible,
                  },
                  onClose: () => setVisible(false),
                  onOpen: () => setVisible(true),
                  translation: dropdownLanguage(currentLanguage),
                }}
              />
            </TouchableOpacity>

            <View style={styles.inputview}>
              <CustomTextInput
                style={[styles.input, inputStyle]}
                placeholderTextColor="#4B4E6E"
                {...props}
              />
            </View>
          </View>
        </ScrollView>
      </CountryModalProvider>
    </View>
  );
}
